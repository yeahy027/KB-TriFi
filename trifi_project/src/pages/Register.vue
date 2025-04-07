<template>
    <div class="container py-5">
      <h2 class="mb-4">회원가입</h2>
      <form @submit.prevent="register">
        <div class="mb-3">
          <label class="form-label">이름</label>
          <input v-model="name" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">닉네임</label>
          <input v-model="nickname" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">이메일</label>
          <input type="email" v-model="email" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">비밀번호</label>
          <input type="password" v-model="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-success w-100">회원가입</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  
  const name = ref('')
  const nickname = ref('')
  const email = ref('')
  const password = ref('')
  const router = useRouter()
  
  const register = async () => {
    await axios.post('http://localhost:3000/users', {
      name: name.value,
      nickname: nickname.value,
      email: email.value,
      password: password.value
    })
    alert('회원가입 성공! 로그인해주세요.')
    router.push('/')
  }
  </script>
  