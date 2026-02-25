<template>
  <div>
    <h1>AI Mood Tracker</h1>
    <textarea v-model="mood" placeholder="How are you feeling?"></textarea>
    <br>
    <button @click="submitMood">Submit</button>
    <p v-if="response">{{ response }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const mood = ref('')
const response = ref('')

const submitMood = () => {
  response.value = "Logic connected! Ready for Backend Part 2."
}
</script>

<style scoped>
div { text-align: center; margin-top: 50px; font-family: sans-serif; }
textarea { width: 300px; height: 100px; }
</style>