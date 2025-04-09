// utils/stats.js
// 주차별로 데이터를 그룹핑해서 비교 꺾은선 그래프용 데이터 가공
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'  // ✅ 이 줄 추가

dayjs.extend(isoWeek)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)  // ✅ 이 줄 추가

// 기존 비교차트 함수에서 사용하던 필터링 함수
function getExpenses(transactions) {
    return transactions.filter(tx => tx.type === 'expense')
}

// 주어진 월에 해당하는 고정 지출 내역 계산
function getMonthlyFixedExpenses(fixedExpenses, userId, month) {
    const weekSums = [0, 0, 0, 0, 0]
  
    fixedExpenses
      .filter(exp => exp.userId === userId)
      .forEach(exp => {
        const end = exp.endDate === '무기한' ? '2100-01-01' : exp.endDate
        const expenseDate = dayjs(exp.date)
        const startMonth = expenseDate.format('YYYY-MM')
        const targetMonth = dayjs(month)
  
        const isWithinEndDate = targetMonth.isBefore(dayjs(end).endOf('month'))
        const isStarted = targetMonth.isAfter(expenseDate.startOf('month')) || targetMonth.isSame(expenseDate, 'month')
  
        if (isStarted && isWithinEndDate) {
          const weekIndex = Math.floor((expenseDate.date() - 1) / 7)
          weekSums[weekIndex] += exp.amount
        }
      })
  
    return weekSums
}

function calculateMonthlyFixedAmount(expense, targetMonth) {
    const endDate = expense.endDate === '무기한' ? '2100-01-01' : expense.endDate
    const isWithinPeriod =
      dayjs(targetMonth).isSameOrAfter(dayjs(expense.date).startOf('month')) &&
      dayjs(targetMonth).isSameOrBefore(dayjs(endDate).endOf('month'))
  
    if (!isWithinPeriod) return 0
  
    // rotation에 따라 월별 지출 계산
    switch (expense.rotation) {
      case 'day': {
        // 매일: 그 달의 일 수 * 금액
        const daysInMonth = dayjs(targetMonth).daysInMonth()
        return daysInMonth * expense.amount
      }
      case 'week': {
        // 매주: 그 달의 주 수 * 금액
        const firstDay = dayjs(targetMonth).startOf('month')
        const lastDay = dayjs(targetMonth).endOf('month')
        const weeks = Math.ceil(lastDay.diff(firstDay, 'day') / 7)
        return weeks * expense.amount
      }
      case 'month':
        return expense.amount // 매달 고정
      case 'year': {
        // 매년: 해당 월이 시작일과 같은 달일 때만 포함
        const startMonth = dayjs(expense.date).month()
        const currentMonth = dayjs(targetMonth).month()
        return startMonth === currentMonth ? expense.amount : 0
      }
      default:
        return 0
    }
  }

  export function getPieChartData(transactions, fixedExpenses = []) {
    const expenses = getExpenses(transactions)
    const byCategory = {}
  
    // 1️⃣ 일반 트랜잭션 지출 합산
    expenses.forEach(tx => {
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount
    })
  
    // 2️⃣ 고정 지출도 카테고리별로 합산
    const nowMonth = dayjs().format('YYYY-MM')
  
    fixedExpenses.forEach(exp => {
      const monthlyAmount = calculateMonthlyFixedAmount(exp, nowMonth)
      console.log("monthlyAmount :", monthlyAmount)
      if (monthlyAmount > 0) {
        byCategory[exp.category] = (byCategory[exp.category] || 0) + monthlyAmount
      }
    })
  
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }))
  }
  

export function getTopSpendingData(transactions) {
  const expenses = getExpenses(transactions)
  const byDescription = {}

  expenses.forEach(tx => {
    byDescription[tx.description] = (byDescription[tx.description] || 0) + tx.amount
  })

  const sorted = Object.entries(byDescription)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return sorted.map(([name, amount]) => ({ name, amount }))
}

export function getCompareData(transactions) {
  const now = dayjs()
  const thisMonth = now.format('YYYY-MM')
  const lastMonth = now.subtract(1, 'month').format('YYYY-MM')

  const thisMonthSum = getExpenses(transactions)
    .filter(tx => tx.date.startsWith(thisMonth))
    .reduce((sum, tx) => sum + tx.amount, 0)

  const lastMonthSum = getExpenses(transactions)
    .filter(tx => tx.date.startsWith(lastMonth))
    .reduce((sum, tx) => sum + tx.amount, 0)

  return [
    { name: '전월', value: lastMonthSum },
    { name: '이번 달', value: thisMonthSum },
  ]
}

export function getIncomeVsExpense(transactions) {
  const income = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const expense = getExpenses(transactions)
    .reduce((sum, tx) => sum + tx.amount, 0)

  return [
    { name: '수입', value: income },
    { name: '지출', value: expense }
  ]
}

export function getCompareChartData(transactions, fixedExpenses, userId) {
    const now = dayjs()
    const thisMonth = now.format('YYYY-MM')
    const lastMonth = now.subtract(1, 'month').format('YYYY-MM')
    const weeks = ['1주차', '2주차', '3주차', '4주차', '5주차']
  
    function getWeeklySums(month) {
      const weekSums = [0, 0, 0, 0, 0]
  
      getExpenses(transactions)
        .filter(tx => tx.userId === userId && tx.date.startsWith(month))
        .forEach(tx => {
          const week = dayjs(tx.date).date()
          const weekIndex = Math.floor((week - 1) / 7)
          weekSums[weekIndex] += tx.amount
        })
  
      const fixed = getMonthlyFixedExpenses(fixedExpenses, userId, month)
      for (let i = 0; i < 5; i++) {
        weekSums[i] += fixed[i]
      }
  
      return weekSums
    }
  
    const thisMonthSums = getWeeklySums(thisMonth)
    const lastMonthSums = getWeeklySums(lastMonth)
  
    return {
      labels: weeks,
      datasets: [
        {
          label: '전달',
          data: lastMonthSums,
          borderColor: '#8AB4F8',
          backgroundColor: 'rgba(138, 180, 248, 0.3)',
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: '이번 달',
          data: thisMonthSums,
          borderColor: '#F9D85E',
          backgroundColor: 'rgba(249, 216, 94, 0.3)',
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    }
}

// 👉 이 함수만 CompareChart.vue에서 호출하면 됨!
export function prepareCompareChartDataFromDB(dbData) {
    if (!dbData || !dbData.transactions || !dbData.fixedExpenses) return null
  
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || !user.id) return null
  
    const userId = parseInt(user.id) || user.id  // string일 수도 있어서
  
    return getCompareChartData(dbData.transactions, dbData.fixedExpenses, userId)
}