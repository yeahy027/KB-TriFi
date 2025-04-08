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
            <input
              type="email"
              v-model="email"
              class="form-control"
              @blur="checkEmailDuplicate"
              :class="{ 'is-invalid': emailExists }"
              required
            />
            <div v-if="emailExists" class="invalid-feedback">
              이미 가입된 이메일입니다.
            </div>
            <div v-else-if="emailChecked" class="valid-feedback d-block text-success">
              사용 가능한 이메일입니다.
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">비밀번호</label>
            <input type="password" v-model="password" class="form-control" required />
          </div>
          <button
            type="submit"
            class="btn w-100 text-white"
            :style="{ backgroundColor: '#2A4185' }"
            :disabled="emailExists"
          >
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
import Swal from 'sweetalert2'

const name = ref('')
const nickname = ref('')
const email = ref('')
const password = ref('')
const emailExists = ref(false)
const emailChecked = ref(false)
const router = useRouter()


// 이메일 중복 확인 함수
const checkEmailDuplicate = async () => {
  if (!email.value) return

  try {
    const res = await axios.get('/api/users', {
      params: { email: email.value }
    })

    if (res.data.length > 0) {
      // 이미 존재하는 이메일
      emailExists.value = true
      emailChecked.value = false
    } else {
      // 사용 가능한 이메일
      emailExists.value = false
      emailChecked.value = true
    }
  } catch (e) {
    console.error('이메일 중복 확인 중 오류:', e)
    emailExists.value = false
    emailChecked.value = false
  }
}

// 등록
const register = async () => {
  if (emailExists.value) {
    Swal.fire({
      title: '회원가입 실패',
      text: '이미 등록된 이메일입니다.',
      icon: 'warning',
      confirmButtonText: '확인'
    })
    return
  }

  try {
    await axios.post('/api/users', {
      name: name.value,
      nickname: nickname.value,
      email: email.value,
      password: password.value
    })

    Swal.fire({
      title: '🎉 회원가입 성공!',
      text: '이제 로그인 후 서비스를 이용해보세요.',
      icon: 'success',
      confirmButtonText: '로그인 하러가기',
      customClass: {
        title: 'fw-bold',
        confirmButton: 'btn btn-primary'
      }
    }).then(() => {
      router.push('/')
    })
  } catch (e) {
    Swal.fire({
      title: '회원가입 실패',
      text: e.response?.data?.message || '알 수 없는 오류가 발생했습니다.',
      icon: 'error',
      confirmButtonText: '확인'
    })
  }
}
</script>

<style scoped>
.object-fit-cover {
  object-fit: cover;
}
</style>
