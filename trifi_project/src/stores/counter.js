import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  function increment() {
    count.value++;
  }

  /* 변경한 부분 */
  const transactions = ref([]);
  const addTransaction = (entry) => {
    transactions.value.push(entry);
  };
  return {
    count,
    doubleCount,
    increment,
    /* 수정사항 */ transactions,
    addTransaction,
  };
});
