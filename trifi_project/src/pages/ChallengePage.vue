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
      <div class="section-card full-width grid-2">
        <div class="info-block">
          <label class="section-title">비슷한 나이대의 지출</label>
          <button class="compare-button">확인하기</button>
        </div>
        <div class="info-block">
          <label class="section-title">비슷한 월급 대비 지출</label>
          <div class="ranking-circle">상위<br /><strong>{{ spendingRank }}%</strong></div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'

const spendingGoal = ref(300000)
const currentSpending = ref(150000)
const spendingRank = ref(60)
const spendingPercent = ref(30)

const spendingRate = computed(() =>
  ((currentSpending.value / spendingGoal.value) * 100).toFixed(1)
)

// 애니메이션 값
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
</script>

<style scoped>
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
</style>
