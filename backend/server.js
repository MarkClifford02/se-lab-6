const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL Database!');
});

// --- ROUTES ---

// 1. Basic Health Check
app.get('/', (req, res) => {
    res.send('Backend API is running and DB connection attempt made.');
});

// 2. Mood Analysis Route (Lab Part 4)
app.post('/api/mood', (req, res) => {
    const { message } = req.body;
    // Simple logic: if message is long, you're expressive.
    const feedback = `Gerald's AI Analysis: Feeling ${message.length > 5 ? 'expressive' : 'quiet'} today!`;
    
    // Optional: You can add logic here to INSERT the mood into your MySQL table later
    res.json({ ai_feedback: feedback });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});