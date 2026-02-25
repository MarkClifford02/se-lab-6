const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection Pool (Solution for Connection Lost errors)
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

// AUTO-TABLE CREATOR: Ito ang gagawa ng table mo sa Railway pag-startup
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to MySQL Database Pool!');
        
        // SQL command para gawin ang table kung wala pa (Part 3 & Lab 3 Schema)
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS moods (
                id INT AUTO_INCREMENT PRIMARY KEY,
                message TEXT NOT NULL,
                ai_response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        connection.query(createTableQuery, (err) => {
            if (err) console.error('❌ Error creating table:', err.message);
            else console.log('🚀 Table "moods" is ready/verified in Railway!');
            connection.release(); // Ibalik ang connection sa pool
        });
    }
});

const GROQ_API_KEY = "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";

// 2. Mood Analysis & Save Route (Lab 3 AI Integration)
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
        // --- STEP B: Offline Fallback (Required by Lab 3) ---
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

// 3. History Route: Para makuha ang data para sa Vue frontend
app.get('/api/history', (req, res) => {
    db.query("SELECT * FROM moods ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));