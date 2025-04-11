<template>
  <AppLayout>
    <!-- 상단 이미지 추가 -->
    <div class="challenge-header-image">
      <img src="@/assets/003.png" alt="챌린지 상단 이미지" />
    </div>

    <div class="challenge-grid">
      <!-- 왼쪽 3줄 -->
      <!-- (1) 이번달 지출 목표 카드 -->
      <div class="section-card left-card-1">
        <div class="section-header-with-tooltip">
          <label class="section-title">이번달 지출 목표</label>
          <!-- 말풍선을 이 위치로 이동 -->
          <div v-if="daysLeft !== null" class="title-tooltip">
            {{ 'D-' + daysLeft }}일 남음
          </div>
        </div>
        <!-- <label class="section-title">이번달 지출 목표</label> -->
        <p>[ {{ userName }} ] 님, 목표까지 화이팅이에요!</p>
        <p>입력한 이번 달 지출 목표를 지켜봅시다 🎉</p><br>
        <!-- 목표 금액 표시 -->
        <template v-if="!isGoalLoading">
          <template v-if="goalExists && spendingGoal !== null">
            <div class="progress-container">
              <!-- <div class="progress-bar" :style="{ width: animatedProgress + '%' }"></div> -->
              <div class="progress-bar-wrapper">
                <div class="progress-bar" :style="{ width: animatedProgress + '%' }"></div>
              </div>
              <span class="progress-text">
                {{ currentSpending.toLocaleString() }}원 /
                {{ formattedSpendingGoal }}원
              </span>
            </div>
            <button class="goal-button" :disabled="true" title="목표는 수정이 불가능합니다.">목표 금액 설정</button>
            <br>
          </template>
          <template v-else>
            <div class="no-goal-box">
              <template v-if="isTodayFirstDay">
                등록된 목표 금액 내역이 없습니다.
              </template>
              <template v-else>
                현재는 목표 등록 기간이 아닙니다. 다음 챌린지를 기다려주세요 🙏
              </template>
            </div>

            <button class="goal-button"
                    :disabled="!isTodayFirstDay"
                    @click="openModal"
                    :title="isTodayFirstDay ? '목표를 설정하세요' : '매월 1일에만 설정 가능합니다'">
              목표 금액 설정
            </button>
          </template>
        </template>
      </div>

      <!-- (2) 지출 비율 카드 -->
      <div class="section-card left-card-2 grid-2">
        <label class="section-title">지출 비율</label>
        <p>입력한 이번 달 지출 목표 대비 현재 지출 상태 비율 입니다</p>
        <div class="pie-chart">
          <svg width="150" height="150" viewBox="0 0 36 36">
            <circle class="circle-bg" cx="18" cy="18" r="15.9155" fill="none" stroke="#eee" stroke-width="3" />
            <circle class="circle" cx="18" cy="18" r="15.9155" fill="none" stroke="#FF6B6B" stroke-width="3" :stroke-dasharray="animatedPie + ', 100'" />
          </svg>
          <span class="pie-label">{{ spendingPercent }}%</span>
        </div>
      </div>

      <!-- 오른쪽: 누적 성과 + 랭킹 -->
      <div class="right-card">
        <!-- 별 아이콘 -->
        <div class="ranking-header">⭐ 챌린지 순위표 ⭐</div>
        <ul class="ranking-list">
          <li
            v-for="(user, index) in rankedChallengeRanking"
            :key="user.id"
            :class="{ 'my-rank': user.id === userId }"
          >
            <span>{{ index + 1 }}등 - {{ user.name }}</span>
            <span class="percent">{{ user.successCount }}회 성공 / 최대 {{ user.maxStreak }}연속</span>
          </li>
        </ul>
        <br>

        <div class="challenge-summary">
          <h3>⭐ 챌린지 누적 성과 ⭐</h3>
          <p>[ {{ userName }} ] 님이 참여하신 챌린지 누적 성과 입니다</p>
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
              <div class="stat-icon">🎯</div>
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
import Swal from 'sweetalert2'
import AppLayout from '@/components/AppLayout.vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
userStore.checkLocalStorage()

const userId = userStore.user.id
const userName = userStore.user.name

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
const currentStreak = ref(0) // 연속 성공일을 프론트에서 추적

// 챌린지 순위표
const challengeRanking = ref([])

// 목표 금액 있는지 여부
const goalExists = computed(() => spendingGoal.value > 0)

const formattedSpendingGoal = computed(() =>
  spendingGoal.value ? spendingGoal.value.toLocaleString() : ''
)

const startDate = ref(null)
const daysLeft = ref(null)

const isTodayFirstDay = computed(() => {
  const today = new Date()
  return today.getDate() === 1
})

const calculateDaysLeft = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  // 다음 달 1일 계산 (0-indexed month이므로 +1)
  const nextMonth = new Date(year, month + 1, 1)

  // 남은 일수 계산
  const diff = Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24))
  daysLeft.value = diff > 0 ? diff : 0
  console.log("다음 챌린지까지 남은 일수 (D-):", daysLeft.value)
}

// 챌린지 성공 여부 판단 및 업데이트
const checkChallengeStatus = async () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const { data: prevSuccess } = await axios.get(`/api/challengeSuccess?userId=${userId}&year=${year}&month=${month}`)
  if (prevSuccess.length > 0) return

  const { data: historyRes } = await axios.get(`/api/challengeHistory?userId=${userId}`)
  const history = historyRes[0]

  if (currentSpending.value > spendingGoal.value) {
    Swal.fire({
      icon: 'error',
      title: '챌린지 실패!',
      text: '💸 이번달 지출이 목표를 초과했어요! 챌린지 실패 😢'
    })

    // 실패 → streak 초기화
    currentStreak.value = 0
  } else {
    Swal.fire({
      icon: 'success',
      title: '챌린지 성공!',
      text: '🎉 이번달 챌린지를 성공했어요! 축하합니다 🥳'
    })


    // 성공 처리
    await axios.post('/api/challengeSuccess', {
      userId,
      year,
      month,
      success: true
    })

    // streak 업데이트
    currentStreak.value += 1
    const newMaxStreak = Math.max(currentStreak.value, history.maxStreak || 0)

    await axios.patch(`/api/challengeHistory/${history.id}`, {
      successCount: (history.successCount || 0) + 1,
      maxStreak: newMaxStreak
    })

    fetchUserStats()
  }
}


// 목표 금액 설정 + 참여 횟수 증가
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

    // challengeHistory 참여 횟수 증가
    const { data: historyRes } = await axios.get(`/api/challengeHistory?userId=${userId}`)
    if (historyRes.length > 0) {
      const history = historyRes[0]
      await axios.patch(`/api/challengeHistory/${history.id}`, {
        participationCount: (history.participationCount || 0) + 1
      })
    } else {
      // 최초 참여 시 challengeHistory 생성
      await axios.post(`/api/challengeHistory`, {
        userId,
        successCount: 0,
        maxStreak: 0,
        participationCount: 1
      })
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
    const { data } = await axios.get(`/api/challengeHistory?userId=${userId}`)
    if (data.length > 0) {
      const stat = data[0]
      totalNoSpendDays.value = stat.successCount || 0
      maxNoSpendStreak.value = stat.maxStreak || 0
      challengeParticipation.value = stat.participationCount || 0
    }
  } catch (err) {
    console.error('챌린지 성과 불러오기 실패:', err)
  }
}

// 챌린지 순위표 계산
const rankedChallengeRanking = computed(() => {
  const ranked = [...challengeRanking.value]
    .sort((a, b) => {
      if (b.successCount !== a.successCount) {
        return b.successCount - a.successCount
      }
      if (b.maxStreak !== a.maxStreak) {
        return b.maxStreak - a.maxStreak
      }
      return 0 // 같으면 동일한 순위
    })
    .slice(0, 3) // 상위 3명만
  console.log("rankedChallengeRanking: ", rankedChallengeRanking)
  return ranked
})


// 챌린지 순위표 불러오기
async function fetchChallengeRanking() {
  try {
    const { data } = await axios.get('/api/users')
    challengeRanking.value = data
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
    console.log("spendingTransactions : ", spendingTransactions)
    const spendingFixed = fixedExpensesRes.data.filter(item => item.type === '지출')
    console.log("spendingFixed : ", spendingFixed)

    const total = [...spendingTransactions, ...spendingFixed]
      .reduce((sum, item) => sum + Number(item.amount), 0)

    console.log("total : ", total)

    currentSpending.value = total
    console.log("currentSpending.value : ", currentSpending.value)
    spendingPercent.value = spendingGoal.value > 0 ? Math.round((total / spendingGoal.value) * 100) : 0
    console.log("spendingPercent.value : ", spendingPercent.value)
    

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
  isGoalLoading.value = true
  await fetchGoal()
  await fetchTotalSpending()
  await fetchChallengeRanking()
  await fetchUserStats()
  // await checkChallengeStatus()
  calculateDaysLeft()
  isGoalLoading.value = false

  // ✅ 목표 초과 시 알림
  if (goalExists.value && currentSpending.value > spendingGoal.value) {
    Swal.fire({
      icon: 'warning',
      title: '목표 초과!',
      text: '목표 금액보다 플렉스 해버리셨네요.. 다음 챌린지에 다시 도전해봅시다! 💸'
    })
  }
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
  grid-template-columns: repeat(2, 1fr); /* 왼쪽 2칸 + 오른쪽 1칸 구조 */
  grid-template-areas:
    "left left"
    "right right";
  gap: 1rem;
  margin: 1rem;
}

/* 왼쪽 카드 */
.left-card-1, .left-card-2, .left-card-3 {
  grid-column: 1;
}

.left-card-1 { grid-row: 1; }
.left-card-2 { grid-row: 2; }


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


/* 챌린지 요약 */
.challenge-summary h3 {
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: 600;
  text-align: center;
  color: #333;
}

.challenge-summary p {
  font-size: 12px;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
  color: #333;
}

.summary-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 5%;
  overflow: hidden;
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

.section-header-with-tooltip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.title-tooltip {
  background-color: #ff6b6b;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  white-space: nowrap;
  position: relative;
}

.title-tooltip::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 100%;
  margin-top: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent #ff6b6b transparent transparent;
}

/* progress 컨테이너 부분 */
.progress-container {
  position: relative;
  margin-bottom: 10px;
}
.progress-bar-wrapper {
  position: relative;
  background-color: #eee;
  border-radius: 10px;
  height: 30px;
  overflow: hidden;
}
.progress-bar {
  background-color: #FF6B6B;
  height: 100%;
  border-radius: 10px;
  transition: width 1s ease-in-out;
}

.progress-text {
  font-size: 16px;
  color: #ffffff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.progress-tooltip {
  position: absolute;
  top: -35px;
  transform: translateX(-50%);
  background: #ff6b6b;
  color: #ff3b3b;
  padding: 5px 8px;
  border-radius: 10px;
  font-size: 12px;
  white-space: nowrap;
}
.progress-tooltip::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: #ff6b6b transparent transparent transparent;
}

/* 파이 차트 */
.pie-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 150px;
  height: 150px;
  margin: 1rem auto;
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

/* 챌린지 순위표 */
.ranking-header {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
  text-align: center;
  color: #333;
}

.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: visible;
  padding-bottom: 2px; /* 아래쪽 공간 확보 */
}

.ranking-list li {
  display: flex;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 16px;
}

.ranking-list li:last-child {
  border-bottom: none;
}

.ranking-list li:nth-child(1)::before {
  content: "🥇 ";
}

.ranking-list li:nth-child(2)::before {
  content: "🥈 ";
}

.ranking-list li:nth-child(3)::before {
  content: "🥉 ";
}

.ranking-list li span {
  font-weight: 500;
  color: #444;
}

.ranking-list li .percent {
  color: #FF6B6B;
  font-weight: bold;
}

.my-rank {
  border: 2px solid rgb(255, 142, 142);
  animation: blink 1s infinite;
  padding: 5px;
}

.ranking-list li.my-rank {
  /* background-color: rgba(255, 0, 0, 0.1); 빨간 강조 표시 */
  border: 1px solid red;
  border-radius: 8px;
  margin: 2px 0;
  z-index: 2;
  position: relative;
  
}
@keyframes blink {
  0% { box-shadow: 0 0 5px red; }
  50% { box-shadow: 0 0 10px red; }
  100% { box-shadow: 0 0 5px red; }
}

/* 반응형 디자인 추가 */
@media screen and (max-width: 768px) {
  .challenge-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-card,
  .right-card {
    width: 100% !important;
    margin: 0 auto;
  }
}
</style>