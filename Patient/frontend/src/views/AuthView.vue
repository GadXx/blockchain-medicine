<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl font-bold mb-4">Authentication</h1>
    <form @submit.prevent="handleLogin" class="flex flex-col gap-4" v-if="!showRegister">
      <input v-model="identifier" type="text" placeholder="Email or Phone" class="input" />
      <input v-model="password" type="password" placeholder="Password" class="input" />
      <p v-on:click="swichAuth">Register</p>
      <button type="submit" class="btn">Login</button>
    </form>
    <form @submit.prevent="handleRegister" class="flex flex-col gap-4" v-if="showRegister">
      <input v-model="email" type="text" placeholder="Email" class="input" />
      <input v-model="phone" type="text" placeholder="Phone" class="input" />
      <input v-model="password" type="password" placeholder="Password" class="input" />
      <p v-on:click="swichAuth">Login</p>
      <button type="submit" class="btn">Register</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const $router = useRouter()

const identifier = ref('')
const password = ref('')
const email = ref('')
const phone = ref('')

const showRegister = ref(false)

const swichAuth = () => {
  showRegister.value = !showRegister.value
}

const handleRegister = () => {
  axios.post('http://localhost:3000/auth/register', {
    email: email.value,
    phone: phone.value,
    password: password.value,
  })
  .then((response) => {
    console.log(response.data)
  })
  .catch((error) => {
    console.error(error)
  })
}

const handleLogin = () => {
  axios.post('http://localhost:3000/auth/login', {
    identifier: identifier.value,
    password: password.value,
  })
  .then((response) => {
    console.log(response.data)
    sessionStorage.setItem('token', `Bearer ${response.data.token}`)
    const user = response.data.user
    localStorage.setItem('user', JSON.stringify(user))
    $router.push({ name: 'home' })
  })
  .catch((error) => {
    alert('Login failed. Please check your credentials.')
    console.error(error)
  })
  .finally(() => {
    identifier.value = ''
    password.value = ''
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
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
