<template>
  <AppLayout>
    <div class="challenge-container">
      <h2>무지출 챌린지</h2>

      <!-- 이번달 지출 목표 -->
      <div class="section-card full-width">
        <label class="section-title">이번달 지출 목표</label>
        <div class="progress-container">
          <div
            class="progress-bar"
            :style="{ width: animatedProgress + '%' }"
          ></div>
          <span class="progress-text">
            {{ currentSpending.toLocaleString() }}원 /
            {{ spendingGoal.toLocaleString() }}원
          </span>
        </div>
      </div>

      <!-- 전체 대비 지출 비율 -->
      <div class="section-card full-width">
        <label class="section-title">지출 비율</label>
        <div class="pie-chart">
          <svg width="100" height="100" viewBox="0 0 36 36">
            <circle
              class="circle-bg"
              cx="18" cy="18" r="15.9155"
              fill="none"
              stroke="#eee"
              stroke-width="3"
            />
            <circle
              class="circle"
              cx="18" cy="18" r="15.9155"
              fill="none"
              stroke="#FF6B6B"
              stroke-width="3"
              :stroke-dasharray="`${animatedPie}, 100`"
            />
          </svg>
          <span class="pie-label">{{ spendingPercent }}%</span>
        </div>
      </div>

      <!-- 비슷한 나이대 / 월급 대비 지출 정보 -->
      <div class="section-card full-width grid-2">
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
      </div>

      <!-- [New] 챌린지 누적 성과 섹션 -->
      <div class="section-card full-width challenge-summary-card">
        <label class="section-title">챌린지 누적 성과</label>
        <div class="summary-metrics">
          <div class="metric">
            <div class="metric-value">{{ totalNoSpendDays }}</div>
            <div class="metric-label">누적 무지출일</div>
          </div>
          <div class="metric">
            <div class="metric-value">{{ maxNoSpendStreak }}</div>
            <div class="metric-label">최대 연속 성공</div>
          </div>
          <div class="metric">
            <div class="metric-value">{{ challengeParticipation }}</div>
            <div class="metric-label">참여 횟수</div>
          </div>
        </div>
      </div>
      <!-- / 챌린지 누적 성과 섹션 끝 -->

    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'

/* 기존 로직 */
const spendingGoal = ref(300000)
const currentSpending = ref(150000)
const spendingRank = ref(60)
const spendingPercent = ref(30)

const spendingRate = computed(() =>
  ((currentSpending.value / spendingGoal.value) * 100).toFixed(1)
)

/* 진행바 & 파이 그래프 애니메이션 값 */
const animatedProgress = ref(0)
const animatedPie = ref(0)

onMounted(() => {
  // 진행바 애니메이션
  let progress = 0
  const interval = setInterval(() => {
    if (progress < spendingRate.value) {
      progress += 1
      animatedProgress.value = progress
    } else {
      clearInterval(interval)
    }
  }, 10)

  // 파이 그래프 애니메이션
  let pie = 0
  const pieInterval = setInterval(() => {
    if (pie < spendingPercent.value) {
      pie += 1
      animatedPie.value = pie
    } else {
      clearInterval(pieInterval)
    }
  }, 20)
})

/* [New] 챌린지 누적 성과 관련 state */
const totalNoSpendDays = ref(12)          // 누적 무지출일
const maxNoSpendStreak = ref(5)          // 최대 연속 성공
const challengeParticipation = ref(3)     // 참여 횟수
</script>

<style scoped>
/* 기본 레이아웃 */
.challenge-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.full-width {
  width: 100%;
}

.section-card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px 32px;
  margin-bottom: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  height: 220px;
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

/* 진행바 */
.progress-container {
  background-color: #eee;
  height: 52px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  background-color: #FF6B6B;
  height: 100%;
  border-radius: 12px;
  transition: width 0.4s ease-in-out;
}

.progress-text {
  font-size: 15px;
  font-weight: 500;
  position: absolute;
  width: 100%;
  text-align: center;
  top: 0;
  line-height: 52px;
  color: #000;
}

/* 파이 그래프 */
.pie-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 12px;
}

.pie-label {
  position: absolute;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.circle-bg {
  stroke: #ddd;
}

.circle {
  transform: rotate(-90deg);
  transform-origin: center;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease-out;
}

/* 비교 섹션 */
.grid-2 {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  height: 100%;
  gap: 32px;
}

.info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.compare-button {
  background-color: #fff;
  border: 2px solid #FF6B6B;
  color: #FF6B6B;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.ranking-circle {
  border: 3px solid #FF6B6B;
  border-radius: 50%;
  width: 110px;
  height: 110px;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

/* [New] 챌린지 누적 성과 */
.challenge-summary-card {
  height: auto; /* 높이 고정 대신, 내용 따라 늘어나게 */
}

.summary-metrics {
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.metric {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #FF6B6B;
}

.metric-label {
  margin-top: 4px;
  font-size: 14px;
  color: #666;
}
</style>
