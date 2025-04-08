<template>
  <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
    <div
      class="row shadow-lg rounded-4 overflow-hidden w-100"
      style="max-width: 1000px; background: white;"
    >
      <!-- 로그인 폼 (왼쪽) -->
      <div class="col-12 col-md-6 p-5 d-flex flex-column justify-content-center">
        <h2 class="mb-4 fw-bold text-center text-md-start" style="color: #2A4185;">로그인</h2>
        <form @submit.prevent="login">
          <div class="mb-3">
            <label class="form-label">이메일</label>
            <input type="email" v-model="email" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">비밀번호</label>
            <input type="password" v-model="password" class="form-control" required />
          </div>
          <button type="submit" class="btn w-100 text-white" :style="{ backgroundColor: '#2A4185' }">
            로그인
          </button>
        </form>

        <!-- 회원가입 링크 -->
        <div class="mt-3 text-center">
          <span>계정이 없으신가요? </span>
          <router-link to="/register" class="fw-bold" style="color: #2A4185;">
            회원가입 하러가기
          </router-link>
        </div>
      </div>

      <!-- 로그인 이미지 (오른쪽 / 데스크탑 전용) -->
      <div class="col-md-6 d-none d-md-block p-0">
        <img
          src="@/assets/login_image3.png"
          alt="로그인 이미지"
          class="img-fluid h-100 w-100 object-fit-cover"
        />
      </div>
    </div>
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

<style scoped>
.object-fit-cover {
  object-fit: cover;
}
</style>
