const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection Pool (Solution para sa Connection Lost errors)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the pool connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to MySQL Database Pool!');
        connection.release();
    }
});

const GROQ_API_KEY = "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";

// 2. Mood Analysis & Save Route
app.post('/api/mood', async (req, res) => {
    const { message } = req.body;
    let aiFeedback = "";

    try {
        // --- STEP A: Groq AI Call ---
        const groqResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "You are a supportive mental health companion. Give a short, calming message." },
                { role: "user", content: `I feel: ${message}` }
            ]
        }, {
            headers: { 
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        aiFeedback = groqResponse.data.choices[0].message.content;
        console.log("🤖 AI Response generated via Groq");

    } catch (error) {
        // --- STEP B: Offline Fallback ---
        console.warn("⚠️ AI API failed, using Offline Fallback.");
        const fallbacks = [
            "Take a deep breath. You are doing better than you think.",
            "It's okay to rest. You don't have to solve everything today.",
            "Small steps still move you forward.",
            "You matter. Your effort matters.",
            "Be kind to yourself. You're learning and growing."
        ];
        aiFeedback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // --- STEP C: Save to Railway MySQL using Pool ---
    const sql = "INSERT INTO moods (message, ai_response) VALUES (?, ?)";
    db.query(sql, [message, aiFeedback], (err, result) => {
        if (err) {
            console.error("❌ DB Insert Error:", err.message);
            return res.status(500).json({ error: "Failed to save to database" });
        }
        
        console.log("📥 Data successfully saved to Railway!");
        res.json({ ai_feedback: aiFeedback });
    });
});

// 3. History Route
app.get('/api/history', (req, res) => {
    db.query("SELECT * FROM moods ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));