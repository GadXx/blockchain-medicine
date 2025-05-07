<template>
    <div class="flex flex-col items-center justify-center h-screen">
        <h1 class="text-2xl font-bold mb-4">Профиль</h1>
        <div class="flex flex-col mb-4">
            <p>email:{{ user.email }}</p>
            <p>phone:{{ user.phone }}</p>
        </div>
        <button class="btn w-50">Регистрация мед карты</button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const user = JSON.parse(localStorage.getItem('user') || '{}');
if (user._id === undefined) {
    window.location.href = '/auth';
}

const userRegisteredCard = ref(user.contract_address);

const registerCard = () => {
}

</script>

<style scoped>
.btn {
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>