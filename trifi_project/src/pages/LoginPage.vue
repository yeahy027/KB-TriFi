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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const email = ref('')
const password = ref('')
const router = useRouter()

// 👉 이미 로그인된 사용자라면 /home으로 리다이렉트
onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    router.push('/home')
  }
})

const login = async () => {
  try {
    const { data } = await axios.get('/api/users', {
      params: { email: email.value, password: password.value }
    })

    if (data.length > 0) {
      // ✅ 사용자 정보 저장
      localStorage.setItem('user', JSON.stringify(data[0]))

      // ✅ 로그인 시간 저장 (자동 로그아웃용)
      localStorage.setItem('loginTime', new Date().toISOString())

      // ✅ 홈으로 이동
      router.push('/home')
    } else {
      Swal.fire({
        title: '로그인 실패',
        text: '이메일 또는 비밀번호가 일치하지 않습니다.',
        icon: 'error',
        confirmButtonText: '확인',
        customClass: {
          title: 'fw-bold',
          confirmButton: 'btn btn-danger'
        }
      })
    }
  } catch (e) {
    Swal.fire({
      title: '오류 발생',
      text: '서버와의 연결에 문제가 발생했습니다.',
      icon: 'warning',
      confirmButtonText: '확인'
    })
    console.error(e)
  }
}
</script>

<style scoped>
.object-fit-cover {
  object-fit: cover;
}
</style>
