<template>
  <div id="app" class="main-container">
    <div class="glass-card">
      <header>
        <h1>🌟 Gerald's AI Mood Tracker</h1>
        <p class="subtitle">Real-time Sentiment Analysis</p>
      </header>
      
      <div class="input-section">
        <textarea 
          v-model="userMood" 
          placeholder="How are you feeling today?" 
          class="mood-input"
          rows="3"
        ></textarea>
        
        <button @click="sendMood" :disabled="loading" class="analyze-btn">
          <span v-if="!loading">Analyze Mood</span>
          <span v-else class="loader"></span>
        </button>
      </div>

      <transition name="fade">
        <div v-if="aiResponse" class="response-box">
          <h3>AI Analysis Result:</h3>
          <p>{{ aiResponse }}</p>
        </div>
      </transition>

      <footer class="footer-note">
        <small>Connected to: Node.js API on Render | MySQL Cloud</small>
      </footer>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userMood: '',
      aiResponse: '',
      loading: false
    };
  },
  methods: {
    async sendMood() {
      if (!this.userMood) return alert("Please enter your mood!");
      
      this.loading = true;
      try {
        // Change this URL to your Render URL later for final deployment
        const response = await axios.post('http://localhost:5000/api/mood', {
          message: this.userMood
        });
        this.aiResponse = response.data.ai_feedback;
      } catch (error) {
        console.error(error);
        this.aiResponse = "Error: Backend unreachable. Is server.js running?";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Main Background */
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Glassmorphism Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 550px; /* Limits width on desktop */
  text-align: center;
}

.subtitle { color: #666; margin-bottom: 2rem; }

/* Responsive Input Section */
.input-section {
  display: flex;
  flex-direction: column; /* Stacked for mobile */
  gap: 15px;
}

.mood-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  resize: none;
  transition: border-color 0.3s;
}

.mood-input:focus {
  outline: none;
  border-color: #764ba2;
}

.analyze-btn {
  padding: 15px;
  background: #764ba2;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, background 0.3s;
}

.analyze-btn:hover:not(:disabled) {
  background: #5a3782;
  transform: translateY(-2px);
}

.analyze-btn:disabled { opacity: 0.7; cursor: not-allowed; }

/* Responsive Adjustments */
@media (min-width: 768px) {
  .glass-card { padding: 3.5rem; }
  h1 { font-size: 2rem; }
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter, .fade-leave-to { opacity: 0; }

.response-box {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f3e5f5;
  border-radius: 12px;
  color: #4a148c;
}

.footer-note { margin-top: 2rem; color: #999; }
</style>