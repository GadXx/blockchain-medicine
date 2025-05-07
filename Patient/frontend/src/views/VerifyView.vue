<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl font-bold mb-4">Верификация</h1>
    <form @submit.prevent="handleVerify" class="flex flex-col gap-4">
      <input v-model="code" type="text" placeholder="Введите код" class="input" />
      <button type="submit" class="btn">Отправить</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import axios from 'axios'
import { ref } from 'vue'

try {
  const token = sessionStorage.getItem('token')
  if (!token) {
    router.push({ name: 'auth' })
  }
  axios.defaults.headers.common['Authorization'] = token
} catch (error) {
  console.error('Error retrieving token:', error)
}

const code = ref('')

const handleVerify = () => {
  axios.put('http://localhost:3000/auth/verify', {
    code: code.value,
  })
  .then((response) => {
    console.log(response.data)
    if (response.data.success) {
      alert('Verification successful!')
      router.push({ name: 'home' })
    } else {
      alert('Verification failed. Please try again.')
    }
  })
  .catch((error) => {
    alert('An error occurred. Please try again.')
  })
  .finally(() => {
    code.value = ''
  })
}
</script>

<style scoped>
.input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn {
  padding: 0.5rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
