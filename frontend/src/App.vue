<template>
  <div class="p-6 max-w-xl mx-auto glass-card">
    <h1 class="text-2xl font-bold mb-4">🧠 AI Mood Support</h1>
    
    <textarea v-model="mood" class="mood-input" placeholder="Describe how you feel..."></textarea>
    
    <button @click="askAI" :disabled="loading" class="analyze-btn">
      {{ loading ? "AI is thinking..." : "Get Support Message" }}
    </button>

    <div v-if="aiMessage" class="mt-6 p-4 bg-green-50 rounded shadow">
      <p class="font-semibold">AI Advice:</p>
      <p>{{ aiMessage }}</p>
    </div>

    <div class="history-section mt-8">
      <h3>📜 Recent History (From Railway)</h3>
      <ul class="history-list">
        <li v-for="item in moodHistory" :key="item.id" class="history-item">
          <strong>You:</strong> {{ item.message }} <br>
          <small><strong>AI:</strong> {{ item.ai_response }}</small>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
const API_URL = 'https://gerald-backend-api.onrender.com/api';

export default {
  data() { return { mood: '', aiMessage: '', loading: false, moodHistory: [] }; },
  methods: {
    async askAI() {
      this.loading = true;
      try {
        const res = await axios.post(`${API_URL}/mood`, { message: this.mood });
        this.aiMessage = res.data.ai_feedback;
        this.mood = "";
        this.fetchHistory(); // I-refresh para makita ang bagong save sa DB
      } catch (e) { console.error("Error connecting to Render:", e); }
      finally { this.loading = false; }
    },
    async fetchHistory() {
      const res = await axios.get(`${API_URL}/history`);
      this.moodHistory = res.data;
    }
  },
  mounted() { this.fetchHistory(); }
}
</script>