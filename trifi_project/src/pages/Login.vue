<template>
    <div class="container py-5">
      <h2 class="mb-4">로그인</h2>
      <form @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label">이메일</label>
          <input type="email" v-model="email" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">비밀번호</label>
          <input type="password" v-model="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary w-100">로그인</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  
  const email = ref('')
  const password = ref('')
  const router = useRouter()
  
  const login = async () => {
    const { data } = await axios.get('http://localhost:3000/users', {
      params: { email: email.value, password: password.value }
    })
    if (data.length > 0) {
      localStorage.setItem('user', JSON.stringify(data[0]))
      router.push('/home')
    } else {
      alert('이메일 또는 비밀번호가 일치하지 않습니다.')
    }
  }
  </script>
  