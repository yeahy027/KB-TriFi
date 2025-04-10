import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isoWeek)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

// 지출만 필터링
function getExpenses(transactions) {
  return transactions.filter(tx => tx.type === '지출')
}

// 고정 지출 중 '지출' 타입만 필터링
function getFixedExpensesOnlySpending(fixedExpenses) {
  return fixedExpenses.filter(exp => exp.type === '지출')
}

function calculateMonthlyFixedAmount(expense, targetMonth) {
  const endDate = expense.endDate === '무기한' ? '2100-01-01' : expense.endDate
  const isWithinPeriod =
    dayjs(targetMonth).isSameOrAfter(dayjs(expense.date).startOf('month')) &&
    dayjs(targetMonth).isSameOrBefore(dayjs(endDate).endOf('month'))

  if (!isWithinPeriod) return 0

  switch (expense.rotation) {
    case 'day':
    case '매일':
      return dayjs(targetMonth).daysInMonth() * expense.amount
    case 'week':
    case '매주': {
      const start = dayjs(targetMonth).startOf('month')
      const end = dayjs(targetMonth).endOf('month')
      const weeks = Math.ceil(end.diff(start, 'day') / 7)
      return weeks * expense.amount
    }
    case 'month':
    case '매월':
      return expense.amount
    case 'year':
    case '매년': {
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

  expenses.forEach(tx => {
    byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount
  })

  const nowMonth = dayjs().format('YYYY-MM')

  // 고정 지출 데이터만 반영
  getFixedExpensesOnlySpending(fixedExpenses).forEach(exp => {
    const monthlyAmount = calculateMonthlyFixedAmount(exp, nowMonth)
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

  return Object.entries(byDescription)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, amount]) => ({ name, amount }))
}

export function getCompareChartData(transactions, fixedExpenses = [], userId) {
  const now = dayjs()
  const thisMonth = now.format('YYYY-MM')
  const lastMonth = now.subtract(1, 'month').format('YYYY-MM')
  const weeks = ['1주차', '2주차', '3주차', '4주차', '5주차']

  function getWeeklySums(month) {
    const weekSums = [0, 0, 0, 0, 0]

    getExpenses(transactions)
      .filter(tx => tx.userId === userId && tx.date.startsWith(month))
      .forEach(tx => {
        const week = Math.floor((dayjs(tx.date).date() - 1) / 7)
        weekSums[week] += tx.amount
      })

    getFixedExpensesOnlySpending(fixedExpenses)
      .filter(exp => exp.userId === userId)
      .forEach(exp => {
        const end = exp.endDate === '무기한' ? '2100-01-01' : exp.endDate
        const start = dayjs(exp.date)
        const target = dayjs(month)

        const isValid =
          target.isSameOrAfter(start.startOf('month')) &&
          target.isSameOrBefore(dayjs(end).endOf('month'))

        if (isValid) {
          const week = Math.floor((start.date() - 1) / 7)
          weekSums[week] += calculateMonthlyFixedAmount(exp, month) / 5
        }
      })

    return weekSums
  }

  const thisMonthData = getWeeklySums(thisMonth)
  const lastMonthData = getWeeklySums(lastMonth)

  return {
    labels: weeks,
    datasets: [
      {
        label: '이번 달',
        data: thisMonthData,
        fill: false,
        borderColor: '#4bc0c0',
        tension: 0.1
      },
      {
        label: '전월',
        data: lastMonthData,
        fill: false,
        borderColor: '#ff6384',
        tension: 0.1
      }
    ]
  }
}

export function getIncomeVsExpense(transactions) {
  const income = transactions
    .filter(tx => tx.type === '수입')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const expense = getExpenses(transactions)
    .reduce((sum, tx) => sum + tx.amount, 0)

  return [
    { name: '수입', value: income },
    { name: '지출', value: expense }
  ]
}
