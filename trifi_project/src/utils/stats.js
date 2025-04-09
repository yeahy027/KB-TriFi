// utils/stats.js

import dayjs from 'dayjs'

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
