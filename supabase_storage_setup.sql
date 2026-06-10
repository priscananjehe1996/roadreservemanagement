-- 1. Create the Storage Bucket for Images
insert into storage.buckets (id, name, public) 
values ('application-attachments', 'application-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Add the new categorical field to the applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_type TEXT;

-- 3. Add the array column to store the public URLs of uploaded images
ALTER TABLE applications ADD COLUMN IF NOT EXISTS attachment_urls TEXT[];

-- Refresh the schema cache so Supabase API picks up the new columns immediately
NOTIFY pgrst, 'reload schema';
