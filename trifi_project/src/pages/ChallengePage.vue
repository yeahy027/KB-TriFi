<template>
  <AppLayout>
    <h1>Challenge</h1>
    <!-- 그리드 레이아웃 감싸는 컨테이너 -->
    <div class="challenge-grid">
      <!-- (1) 이번달 지출 목표 카드 -->
      <div class="section-card left-card-1">
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

      <!-- (2) 지출 비율 카드 -->
      <div class="section-card left-card-2">
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

      <!-- (3) 비슷한 나이대 / 월급 대비 지출 카드 -->
      <div class="section-card left-card-3 grid-2">
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

      <!-- 오른쪽: 챌린지 누적 성과 (3행 높이 차지) -->
      <div class="challenge-summary right-card">
        <h3>챌린지 누적 성과</h3>
        <div class="summary-metrics">
          <!-- 예: 3개 항목(아이콘 + 숫자 + 라벨) -->
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-value">{{ totalNoSpendDays }}<span>일</span></div>
            <div class="stat-label">누적 무지출일</div>
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
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'

/** (기존) 지출 관련 **/
const spendingGoal = ref(300000)
const currentSpending = ref(150000)
const spendingRank = ref(60)
const spendingPercent = ref(30)
const spendingRate = computed(() =>
  ((currentSpending.value / spendingGoal.value) * 100).toFixed(1)
)

/** 진행바 & 파이 그래프 애니메이션 **/
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

/** (새로) 챌린지 누적 성과 값들 **/
const totalNoSpendDays = ref(12)
const maxNoSpendStreak = ref(5)
const challengeParticipation = ref(3)

</script>

<style scoped>

 .challenge-grid {
  display: grid;
  /* 왼쪽: 3행, 오른쪽: 1열이지만 3행 전부 차지 */
  grid-template-columns: 2fr 1fr;           /* 왼쪽 넓게, 오른쪽 좁게 */
  grid-template-rows: repeat(3, 220px);    /* 3줄, 각 220px 고정 */
  gap: 24px;                               /* 카드들 간 간격 */
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/** 왼쪽 카드들 (각각 한 줄씩) **/
.left-card-1 {
  grid-column: 1;
  grid-row: 1; /* 첫 번째 행 */
}
.left-card-2 {
  grid-column: 1;
  grid-row: 2; /* 두 번째 행 */
}
.left-card-3 {
  grid-column: 1;
  grid-row: 3; /* 세 번째 행 */
}

/** 오른쪽 카드(챌린지 누적 성과)는 3행 모두 차지 */
.right-card {
  grid-column: 2;
  grid-row: 1 / span 3; /* 첫 번째 행부터 시작해서 아래로 3행 차지 */
  padding: 24px;
  border-radius: 12px;
  background-color: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 위에서부터 차곡차곡 */
}

/** 챌린지 누적 성과 내부 */
.challenge-summary h3 {
  font-size: 18px;
  margin-bottom: 24px;
  font-weight: 600;
}

.summary-metrics {
  display: flex;
  flex-direction: column; /* 세로로 나열 */
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
  margin-left: auto; /* 아이콘 & 숫자 옆에 라벨이 오도록 */
  font-weight: 500;
}

/** 기존 카드 스타일 (220px 높이 유지) */
.section-card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  /* height: 220px; <= grid로 이미 row 높이를 220px로 했으므로 생략 가능 */
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

/** 진행바 */
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

/** 파이 차트 */
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

/** 비교 섹션 내부 */
.grid-2 {
  display: flex;
  flex-direction: row;
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

/** 반응형: 화면 992px 이하 -> 세로 레이아웃으로 */
@media (max-width: 992px) {
  .challenge-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
    grid-template-columns: none;
    grid-template-rows: none;
  }
  .left-card-1,
  .left-card-2,
  .left-card-3,
  .right-card {
    width: 100%;
    height: auto;
  }
}
</style>
