import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the local attachments directory exists in the G: drive root
const LOCAL_STORAGE_DIR = path.join(__dirname, '../Local_Attachments');
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

async function syncAndCleanStorage() {
  console.log("🚀 Starting Storage Sync and Cleanup...");

  try {
    // 1. Fetch all applications
    const { data: applications, error: dbError } = await supabase
      .from('applications')
      .select('id, attachment_urls');

    if (dbError) throw dbError;

    let totalMoved = 0;

    for (const app of applications) {
      if (!app.attachment_urls || app.attachment_urls.length === 0) continue;

      const updatedUrls = [];
      let modified = false;

      // Ensure directory for this specific application exists
      const appDir = path.join(LOCAL_STORAGE_DIR, `App_${app.id}`);
      if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

      for (const url of app.attachment_urls) {
        // Only process files that are actually in Supabase storage
        if (url.includes('supabase.co/storage/v1/object/public/attachments/')) {
          const filePathInBucket = url.split('/public/attachments/')[1];
          const fileName = path.basename(filePathInBucket);
          const localFilePath = path.join(appDir, fileName);

          console.log(`📥 Downloading App #${app.id}: ${fileName}`);

          // Download from Supabase
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('attachments')
            .download(filePathInBucket);

          if (downloadError) {
            console.error(`❌ Failed to download ${fileName}:`, downloadError.message);
            updatedUrls.push(url); // Keep original if failed
            continue;
          }

          // Write to local G: drive
          const buffer = Buffer.from(await fileData.arrayBuffer());
          fs.writeFileSync(localFilePath, buffer);
          console.log(`✅ Saved locally: ${localFilePath}`);

          // Delete from Supabase cloud
          const { error: removeError } = await supabase.storage
            .from('attachments')
            .remove([filePathInBucket]);

          if (removeError) {
            console.error(`⚠️ Failed to delete ${fileName} from Supabase:`, removeError.message);
          } else {
            console.log(`🗑️ Deleted from cloud: ${fileName}`);
          }

          // Update URL to point to local path instead of cloud URL
          updatedUrls.push(`LOCAL:\\Local_Attachments\\App_${app.id}\\${fileName}`);
          modified = true;
          totalMoved++;
        } else {
          // It's already local or from another source, keep as is
          updatedUrls.push(url);
        }
      }

      // Update database record if any files were migrated
      if (modified) {
        const { error: updateError } = await supabase
          .from('applications')
          .update({ attachment_urls: updatedUrls })
          .eq('id', app.id);
        
        if (updateError) {
          console.error(`❌ Failed to update App #${app.id} record:`, updateError.message);
        } else {
          console.log(`💾 Updated App #${app.id} database record with local paths.`);
        }
      }
    }

    console.log(`\n🎉 Sync Complete! Successfully moved ${totalMoved} files to the local G: Drive.`);

  } catch (error) {
    console.error("❌ Fatal Sync Error:", error);
  }
}

// Run the script
syncAndCleanStorage();
