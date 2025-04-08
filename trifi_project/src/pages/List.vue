<template>
  <div>
    <button @click="isModalOpen = true">+ 등록</button>
    <RegisterEdit v-if="isModalOpen" @close="isModalOpen = false" />
  </div>
</template>
<script setup>
import { ref } from 'vue';
import RegisterEdit from '@/pages/Register_edit.vue';
const isModalOpen = ref(false);
</script>
