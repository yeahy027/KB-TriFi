import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import axios from 'axios';

export const useUserStore = defineStore('user', () => {
  const BASEURI = '/api/moneykeeper';

  // 상태 변수
  const states = reactive({
    user: {
      id: '',
      name: '',
      nickName: '',
      email: '',
      password: '',
      country: '',
      language: '',
    },
  });

  // getter (computed)
  const user = computed(() => states.user);

  // 액션 - 사용자 정보 가져오기
  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users/${states.user.id}`);
      if (response.status === 200) {
        states.user = response.data;
      } else {
        alert('사용자 정보 조회 실패');
      }
    } catch (error) {
      alert('에러 발생: ' + error);
    }
  };

  // 액션 - 사용자 정보 수정하기
  const updateUser = async (updatedUser, successCallback) => {
    try {
      const response = await axios.put(BASEURI, updatedUser);
      if (response.status === 200) {
        states.user = { ...states.user, ...updatedUser };
        successCallback(); // 성공 시 콜백 호출
      } else {
        alert('사용자 정보 수정 실패');
      }
    } catch (error) {
      alert('에러 발생: ' + error);
    }
  };

  // 액션 - 사용자 정보 삭제하기
  const deleteUser = async (successCallback) => {
    try {
      const response = await axios.delete(`/api/users/${states.user.id}`);
      if (response.status === 200) {
        logoutUser();

        successCallback(); // 성공 시 콜백 호출
      } else {
        alert('사용자 정보 삭제 실패');
      }
    } catch (error) {
      alert('에러 발생: ' + error);
    }
  };

  const loginUser = (user) => {
    states.user = { ...user };
  };

  const checkLocalStorage = () => {
    const user = localStorage.getItem('user');
    if (user) {
      loginUser(JSON.parse(user));
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    localStorage.removeItem('user'); // 저장된 유저 정보 삭제
    states.user = {
      name: '',
      nickName: '',
      email: '',
      country: '',
      language: '',
    };
  };

  return {
    user,
    fetchUser,
    updateUser,
    deleteUser,
    loginUser,
    checkLocalStorage,
    logoutUser,
  };
});
