<script setup lang="ts">
// import TheWelcome from '../components/TheWelcome.vue'
import MyModal from '../components/teleport/MyModal.vue'
console.log(import.meta.env.VITE_SOME_KEY) // 123
console.log(import.meta.env.DB_PASSWORD) // undefined
console.log("process.env", process.env)
</script>

<template>
  <main>
    <!-- <TheWelcome /> -->

    <MyModal />
  </main>
</template>
