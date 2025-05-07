<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-3xl font-bold mb-4">Welcome to the App</h1>
    <router-link v-if="!loginSuccess" to="/auth" class="link">Авторизация</router-link>
    <p v-if="loginSuccess" v-on:click="logout" class="link">Выйти</p>
    <router-link v-if="loginSuccess" to="/profile" class="link">Профиль</router-link>
    <router-link v-if="loginSuccess" to="/verify" class="link">Верификация</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loginSuccess = ref(sessionStorage.getItem('token') !== null)

const logout = () => {
  sessionStorage.removeItem('token')
  localStorage.removeItem('user')
  loginSuccess.value = false
}
</script>

<style scoped>
.link {
  margin: 0.5rem;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}
</style>