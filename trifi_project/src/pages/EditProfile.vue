<template>
  <AppLayout>
    <div class="edit-profile">
      <!-- 헤더 -->
      <div class="header">
        <h1>Edit Profile</h1>
      </div>

      <!-- 유저 정보 섹션 -->
      <div class="account-section">
        <div class="account-header">
          <img class="basic-img" src="../basic-img.png" alt="User profile" />
          <div class="user-info">
            <h2>{{ form.nickname }}</h2>
            <p>{{ form.email }}</p>
          </div>
          <button class="yellow-btn edit-button" @click="updateProfile">
            회원정보 수정 >
          </button>
        </div>
      </div>

      <!-- 폼 입력 섹션 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl">
        <div v-for="(field, index) in fields" :key="index">
          <label class="block mt-4 mb-2 text-gray-700 font-medium">
            {{ field.label }}
          </label>

          <div v-if="field.type === 'select'">
            <select
              v-model="form[field.model]"
              :disabled="!isEditing"
              class="w-full p-2 border rounded-lg bg-gray-50"
            >
              <option disabled value="">Select {{ field.label }}</option>
              <option
                v-for="option in field.options"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </div>

          <!-- <div v-else>
            <input
              type="text"
              v-model="form[field.model]"
              :placeholder="field.placeholder"
              :disabled="!isEditing"
              class="w-full p-2 border rounded-lg bg-gray-50"
            />
          </div> -->
          <div v-else>
            <input
              :type="field.type"
              v-model="form[field.model]"
              :placeholder="field.placeholder"
              :disabled="!isEditing"
              class="w-full p-2 border rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue';
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';

const userStore = useUserStore(); // Pinia store 가져오기
const form = computed(() => userStore.user); // 최신 user 데이터

onMounted(() => {
  userStore.checkLocalStorage();
});

const isEditing = ref(true);

const fields = [
  {
    label: 'Nick Name',
    model: 'nickname',
    placeholder: 'Enter your nickname',
    type: 'text',
  },
  {
    label: 'Country',
    model: 'country',
    type: 'select',
    options: ['Korea', 'USA', 'Canada', 'UK', 'Japan'],
  },
  {
    label: 'Language',
    model: 'language',
    type: 'select',
    options: ['Korean', 'English', 'Japanese', 'Spanish', 'French'],
  },
  {
    label: 'Email',
    model: 'email',
    placeholder: 'Enter your email',
    type: 'email',
  },
];

const updateProfile = async () => {
  try {
    const response = await axios.put(`/api/users/${form.id}`, form);
    userStore.updateUser(form); // Pinia store에 업데이트된 데이터 저장
    alert('프로필이 성공적으로 업데이트되었습니다!');
  } catch (error) {
    console.error('프로필 업데이트 실패:', error);
    alert('프로필 업데이트 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped>
/* 스타일은 그대로 유지 */
input[disabled],
select[disabled] {
  cursor: not-allowed;
  opacity: 0.6;
}

.edit-profile {
  padding-left: 20px;
  padding-top: 20px;
  font-family: 'Arial', sans-serif;
}

.header h1 {
  font-size: 32px;
  margin-bottom: 20px;
}

.account-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 30px;
}

.account-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.basic-img {
  width: 66px;
  height: 66px;
  border-radius: 50%;
}

.user-info h2 {
  margin: 0;
  font-size: 20px;
}

.user-info p {
  margin: 4px 0 0;
  color: gray;
}

.yellow-btn {
  background-color: #f4c542;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
}

.edit-button {
  margin-left: auto;
  margin-right: 110px;
}
</style>
