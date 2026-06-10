import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Endpoint to handle form submissions
app.post('/api/submit', async (req, res) => {
    try {
        const formData = req.body;
        
        // Using service_role key for privileged write
        const { data, error } = await supabase
            .from('applications')
            .insert([formData]);

        if (error) {
            console.error("Supabase Error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Serve static frontend files if in production
// app.use(express.static(path.join(__dirname, '../dist')));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
