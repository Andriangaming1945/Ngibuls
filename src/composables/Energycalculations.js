export const DEFAULT_TARIFF_PER_KWH = 1444.7 // Rp per kWh
export const DEFAULT_TARIFF_PER_M3 = 10000 // Rp per m3 air
export const LITER_PER_MINUTE = 8 // asumsi debit air rata-rata per menit pemakaian

export function deviceMonthlyKwh(device) {
  const watt = Number(device.watt) || 0
  const hours = Number(device.hoursPerDay) || 0
  const days = Number(device.daysPerMonth) || 0
  const qty = Number(device.quantity) || 1
  return (watt / 1000) * hours * days * qty
}

export function deviceMonthlyCost(device, tariffPerKwh = DEFAULT_TARIFF_PER_KWH) {
  return deviceMonthlyKwh(device) * tariffPerKwh
}

export function activityMonthlyLiters(activity) {
  const minutes = Number(activity.minutes) || 0
  const times = Number(activity.timesPerDay) || 0
  const days = Number(activity.daysPerMonth) || 30
  return minutes * times * days * LITER_PER_MINUTE
}

export function activityMonthlyCost(activity, tariffPerM3 = DEFAULT_TARIFF_PER_M3) {
  const liters = activityMonthlyLiters(activity)
  return (liters / 1000) * tariffPerM3
}

export function totalMonthlyKwh(devices) {
  return devices.reduce((sum, d) => sum + deviceMonthlyKwh(d), 0)
}

export function totalMonthlyLiters(activities) {
  return activities.reduce((sum, a) => sum + activityMonthlyLiters(a), 0)
}

export function formatRupiah(value) {
  return 'Rp' + Math.round(value || 0).toLocaleString('id-ID')
}

export function formatNumber(value, decimals = 1) {
  return Number(value || 0).toLocaleString('id-ID', { maximumFractionDigits: decimals })
}