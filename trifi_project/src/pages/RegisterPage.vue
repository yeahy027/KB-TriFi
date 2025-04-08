<template>
  <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
    <div
      class="row shadow-lg rounded-4 overflow-hidden w-100"
      style="max-width: 1000px; background: white;"
    >
      <!-- 회원가입 폼 (왼쪽) -->
      <div class="col-12 col-md-6 p-5 d-flex flex-column justify-content-center">
        <h2 class="mb-4 fw-bold text-center text-md-start" style="color: #2A4185;">회원가입</h2>
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
          <button type="submit" class="btn w-100 text-white" :style="{ backgroundColor: '#2A4185' }">
            회원가입
          </button>
        </form>

        <!-- 로그인으로 이동 -->
        <div class="mt-3 text-center">
          <span>이미 계정이 있으신가요? </span>
          <router-link to="/" class="fw-bold" style="color: #2A4185;">
            로그인 하러가기
          </router-link>
        </div>
      </div>

      <!-- 오른쪽 이미지 (데스크탑 전용) -->
      <div class="col-md-6 d-none d-md-block p-0">
        <img
          src="@/assets/login_image3.png"
          alt="회원가입 이미지"
          class="img-fluid h-100 w-100 object-fit-cover"
        />
      </div>
    </div>
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

<style scoped>
.object-fit-cover {
  object-fit: cover;
}
</style>
