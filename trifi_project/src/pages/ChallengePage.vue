<template>
  <AppLayout>
    <!-- 상단 이미지 추가 -->
    <div class="challenge-header-image">
      <img src="@/assets/002.png" alt="챌린지 상단 이미지" />
    </div>

    <div class="challenge-grid">
      <!-- 왼쪽 3줄 -->
      <!-- (1) 이번달 지출 목표 카드 -->
      <div class="section-card left-card-1">
        <label class="section-title">이번달 지출 목표</label>
        <p>입력한 이번 달 지출 목표를 지켜봅시다🪄</p>
        <!-- 목표 금액 표시 -->
        <template v-if="!isGoalLoading">
          <template v-if="goalExists && spendingGoal !== null">
            <div class="progress-container">
              <div class="progress-bar" :style="{ width: animatedProgress + '%' }"></div>
              <span class="progress-text">
                {{ currentSpending.toLocaleString() }}원 /
                {{ formattedSpendingGoal }}원
              </span>
            </div>
            <button class="goal-button" :disabled="true" title="목표는 수정이 불가능합니다.">목표 금액 설정</button>
          </template>
          <template v-else>
            <div class="no-goal-box">등록된 목표 금액 내역이 없습니다.</div>
            <button class="goal-button" @click="openModal">목표 금액 설정</button>
          </template>
        </template>
      </div>

      <!-- (2) 지출 비율 카드 -->
      <div class="section-card left-card-2">
        <label class="section-title">지출 비율</label>
        <p>입력한 이번 달 지출 목표 대비 현재 지출 상태 비율 입니다🪄</p>
        <div class="pie-chart">
          <svg width="100" height="100" viewBox="0 0 36 36">
            <circle class="circle-bg" cx="18" cy="18" r="15.9155" fill="none" stroke="#eee" stroke-width="3" />
            <circle class="circle" cx="18" cy="18" r="15.9155" fill="none" stroke="#FF6B6B" stroke-width="3" :stroke-dasharray="animatedPie + ', 100'" />
          </svg>
          <span class="pie-label">{{ spendingPercent }}%</span>
        </div>
      </div>

      <!-- (3) 비교 정보 카드 -->
      <!-- <div class="section-card left-card-3 grid-2">
        <div class="info-block">
          <label class="section-title">비슷한 나이대의 지출</label>
          <button class="compare-button">확인하기</button>
        </div>
        <div class="info-block">
          <label class="section-title">비슷한 월급 대비 지출</label>
          <div class="ranking-circle">
            상위<br />
            <strong>{{ spendingRank }}%</strong>
          </div>
        </div>
      </div> -->

      <!-- 오른쪽: 누적 성과 + 랭킹 -->
      <div class="right-card">
        <!-- 별 아이콘 -->
        <div class="ranking-header">⭐ 챌린지 순위표 ⭐</div>
        <ul class="ranking-list">
          <li v-for="user in challengeRanking" :key="user.id">
            {{ user.name }} - {{ user.savedPercent }}%
          </li>
        </ul>

        <div class="challenge-summary">
          <h3>⭐ 챌린지 누적 성과 ⭐</h3>
          <div class="summary-metrics">
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-value">{{ totalNoSpendDays }}<span>일</span></div>
              <div class="stat-label">누적 성공일</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔥</div>
              <div class="stat-value">{{ maxNoSpendStreak }}<span>일</span></div>
              <div class="stat-label">최대 연속 성공</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏅</div>
              <div class="stat-value">{{ challengeParticipation }}<span>회</span></div>
              <div class="stat-label">챌린지 참여 횟수</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import AppLayout from '@/components/AppLayout.vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
userStore.checkLocalStorage()

const userId = userStore.user.id

const spendingGoal = ref(0)
const currentSpending = ref(0)
const spendingPercent = ref(0)
const animatedProgress = ref(0)
const animatedPie = ref(0)
const isGoalLoading = ref(true)

// 누적 성공 기록
const totalNoSpendDays = ref(0)
const maxNoSpendStreak = ref(0)
const challengeParticipation = ref(0)

// 챌린지 순위표
const challengeRanking = ref([])

// 목표 금액 있는지 여부
const goalExists = computed(() => spendingGoal.value > 0)

const formattedSpendingGoal = computed(() =>
  spendingGoal.value ? spendingGoal.value.toLocaleString() : ''
)

// 챌린지 성공 조건 체크
const checkChallengeStatus = async () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // 이미 성공 처리된 기록이 있다면 중복 방지
  const res = await axios.get(`/api/challengeSuccess?userId=${userId}&year=${year}&month=${month}`)
  if (res.data.length > 0) return

  if (currentSpending.value > spendingGoal.value) {
    alert('💸 이번달 지출이 목표를 초과했어요! 챌린지 실패 😢')
  } else {
    alert('🎉 이번달 챌린지를 성공했어요! 축하합니다 🥳')
    await axios.post('/api/challengeSuccess', {
      userId,
      year,
      month,
      success: true
    })

    const userStatRes = await axios.get(`/api/users/${userId}`)
    const user = userStatRes.data

    await axios.patch(`/api/users/${userId}`, {
      challengeSuccessCount: (user.challengeSuccessCount || 0) + 1,
      challengeParticipation: (user.challengeParticipation || 0) + 1
    })

    fetchUserStats()
  }
}

// 목표 금액 서버 저장
async function submitGoal() {
  const goalAmount = parseInt(newGoal.value)
  if (!goalAmount) return

  try {
    const { data } = await axios.get(`/api/challengeAmount?userId=${userId}`)
    if (data.length > 0) {
      await axios.patch(`/api/challengeAmount/${data[0].id}`, { amount: goalAmount })
    } else {
      await axios.post('/api/challengeAmount', { userId, amount: goalAmount })
    }
    spendingGoal.value = goalAmount
    closeModal()
    await fetchTotalSpending()
    await checkChallengeStatus()
  } catch (err) {
    console.error('목표 설정 실패:', err)
  }
}

// 목표 금액 가져오기
async function fetchGoal() {
  try {
    const { data } = await axios.get(`/api/challengeAmount?userId=${userId}`)
    if (data.length > 0) {
      spendingGoal.value = data[0].amount
    } else {
      spendingGoal.value = 0
    }
  } catch (err) {
    console.error('목표 불러오기 실패:', err)
  } finally {
    isGoalLoading.value = false
  }
}

// 사용자 누적 성과 불러오기
async function fetchUserStats() {
  try {
    const { data } = await axios.get(`/api/users/${userId}`)
    totalNoSpendDays.value = data.challengeSuccessCount || 0
    maxNoSpendStreak.value = data.maxSuccessStreak || 0
    challengeParticipation.value = data.challengeParticipation || 0
  } catch (err) {
    console.error('유저 성과 불러오기 실패:', err)
  }
}

// 챌린지 순위표 불러오기
async function fetchChallengeRanking() {
  try {
    const { data } = await axios.get('/api/users')
    const ranked = data
      .map(user => ({
        id: user.id,
        name: user.name,
        savedPercent: ((user.challengeSuccessCount || 0) / (user.challengeParticipation || 1) * 100).toFixed(1)
      }))
      .sort((a, b) => b.savedPercent - a.savedPercent)

    challengeRanking.value = ranked
  } catch (err) {
    console.error('순위 불러오기 실패:', err)
  }
}

// 총 지출 금액 계산
const fetchTotalSpending = async () => {
  try {
    const [transactionsRes, fixedExpensesRes] = await Promise.all([
      axios.get(`/api/transactions?userId=${userId}`),
      axios.get(`/api/fixedExpenses?userId=${userId}`)
    ])

    const spendingTransactions = transactionsRes.data.filter(item => item.type === '지출')
    const spendingFixed = fixedExpensesRes.data.filter(item => item.type === '지출')

    const total = [...spendingTransactions, ...spendingFixed]
      .reduce((sum, item) => sum + Number(item.amount), 0)

    currentSpending.value = total
    spendingPercent.value = spendingGoal.value > 0 ? Math.round((total / spendingGoal.value) * 100) : 0

    animatedProgress.value = spendingPercent.value
    animatedPie.value = spendingPercent.value

    await checkChallengeStatus()
  } catch (err) {
    console.error('총 지출 계산 실패:', err)
  }
}

// 모달 관련
const showModal = ref(false)
const newGoal = ref('')

function openModal() {
  showModal.value = true
}
function closeModal() {
  showModal.value = false
  newGoal.value = ''
}

// onMounted
onMounted(async () => {
  await fetchGoal()
  await fetchTotalSpending()
  await fetchUserStats()
  await fetchChallengeRanking()
})
</script>



<style scoped>
.challenge-header-image img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-bottom: 2px solid #eee;
}

/* 그리드 구성 */
.challenge-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(3, 220px);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 왼쪽 카드 */
.left-card-1, .left-card-2, .left-card-3 {
  grid-column: 1;
}
.left-card-1 { grid-row: 1; }
.left-card-2 { grid-row: 2; }
.left-card-3 { grid-row: 3; }

/* 오른쪽 */
.right-card {
  grid-column: 2;
  grid-row: 1 / span 3;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 24px;
}

/* 목표 버튼 */
.goal-button {
  margin-top: 16px;
  padding: 8px 12px;
  background-color: #FF6B6B;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.no-goal-box {
  padding: 16px;
  background-color: #f8f8f8;
  border: 1px dashed #ccc;
  border-radius: 8px;
  color: #888;
  text-align: center;
  margin-bottom: 12px;
}
.goal-button[disabled] {
  background-color: #ccc;
  cursor: not-allowed;
}


/* 순위표 */
.ranking-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}
.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
}
.ranking-list li {
  padding: 6px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

/* 챌린지 요약 */
.challenge-summary h3 {
  font-size: 18px;
  margin-bottom: 16px;
  font-weight: 600;
}
.summary-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-icon {
  font-size: 30px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #FF6B6B;
  display: flex;
  align-items: center;
  gap: 3px;
}
.stat-value span {
  font-size: 16px;
  color: #555;
}
.stat-label {
  font-size: 14px;
  color: #666;
  margin-left: auto;
  font-weight: 500;
}

/* 기타 스타일 */
.section-card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
}
.progress-container {
  background: #eee;
  height: 40px;
  border-radius: 7px;
  overflow: hidden;
  margin-bottom: 8px;
  position: relative;
}
.progress-bar {
  height: 50px;
  background-color: #FF6B6B;
  width: 0%;
  transition: width 0.5s ease;
}
.progress-text {
  font-size: 16px;
  color: #ffffff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.pie-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.pie-label {
  position: absolute;
  font-size: 16px;
  font-weight: bold;
  color: #FF6B6B;
}

/* 모달 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal h3 {
  margin-bottom: 8px;
}
.modal input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.modal-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.modal-buttons button {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #FF6B6B;
  color: white;
  font-weight: 600;
}
.modal-buttons button:last-child {
  background: #ccc;
  color: black;
}
</style>
