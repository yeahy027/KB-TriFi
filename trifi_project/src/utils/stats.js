// utils/stats.js
// 주차별로 데이터를 그룹핑해서 비교 꺾은선 그래프용 데이터 가공
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
dayjs.extend(isoWeek)

export function getExpenses(transactions) {
  return transactions.filter(tx => tx.type === 'expense' || tx.fixed)
}

export function getPieChartData(transactions) {
  const expenses = getExpenses(transactions)
  const byCategory = {}

  expenses.forEach(tx => {
    byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount
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

export function getCompareChartData(transactions) {
    const now = dayjs()
    const thisMonth = now.format('YYYY-MM')
    const lastMonth = now.subtract(1, 'month').format('YYYY-MM')
  
    const weeks = ['1주차', '2주차', '3주차', '4주차', '5주차']
  
    function getWeeklySums(month) {
      const weekSums = [0, 0, 0, 0, 0]
  
      getExpenses(transactions)
        .filter(tx => tx.date.startsWith(month))
        .forEach(tx => {
          const week = dayjs(tx.date).date()
          const weekIndex = Math.floor((week - 1) / 7)
          weekSums[weekIndex] += tx.amount
        })
  
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