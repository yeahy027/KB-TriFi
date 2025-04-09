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
          <label for="profileUpload">
            <img
              class="basic-img"
              :src="profilePreview"
              alt="User profile"
              style="cursor: pointer"
            />
          </label>
          <input
            type="file"
            id="profileUpload"
            accept="image/*"
            @change="onProfileChange"
            style="display: none"
          />

          <div class="user-info">
            <h2>{{ user.nickname }}</h2>
            <p>{{ user.email }}</p>
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
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import profileImage from '@/assets/basic-img.png';
import { useRouter } from 'vue-router';
const router = useRouter();
const profilePreview = ref(profileImage);

const onProfileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    profilePreview.value = URL.createObjectURL(file);
  }
};

const userStore = useUserStore(); // Pinia store 가져오기
userStore.checkLocalStorage();
const user = userStore.user;
const form = ref({ ...user }); // 최신 user 데이터

const isEditing = ref(true);

const fields = [
  {
    label: '닉네임',
    model: 'nickname',
    placeholder: 'Enter your nickname',
    type: 'text',
  },
  {
    label: '나라',
    model: 'country',
    type: 'select',
    options: ['Korea', 'USA', 'Canada', 'UK', 'Japan'],
  },
  {
    label: '언어',
    model: 'language',
    type: 'select',
    options: ['Korean', 'English', 'Japanese', 'Spanish', 'French'],
  },
  {
    label: '이메일',
    model: 'email',
    placeholder: 'Enter your email',
    type: 'email',
  },
];

const updateProfile = async () => {
  userStore.updateUser(form.value, router);
};
</script>

<style scoped>
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
  width: 100px;
  height: 100px;
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
