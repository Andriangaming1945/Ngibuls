<script setup>
import { computed } from 'vue'
import { Zap, Droplet, Wallet } from 'lucide-vue-next'
import {
  deviceMonthlyKwh,
  totalMonthlyKwh,
  totalMonthlyLiters,
  activityMonthlyLiters,
  deviceMonthlyCost,
  activityMonthlyCost,
  formatRupiah,
  formatNumber,
} from '@/composables/energyCalculations'

const props = defineProps({
  devices: { type: Array, required: true },
  waterActivities: { type: Array, required: true },
  tariffElectricity: { type: Number, required: true },
  tariffWater: { type: Number, required: true },
  electricityIncluded: { type: Boolean, default: false },
  waterIncluded: { type: Boolean, default: false },
})

const totalKwh = computed(() => totalMonthlyKwh(props.devices))
const totalLiters = computed(() => totalMonthlyLiters(props.waterActivities))

const electricityCost = computed(() =>
  props.devices.reduce((sum, d) => sum + deviceMonthlyCost(d, props.tariffElectricity), 0)
)
const waterCost = computed(() =>
  props.waterActivities.reduce((sum, a) => sum + activityMonthlyCost(a, props.tariffWater), 0)
)
const totalCost = computed(() => {
  return (props.electricityIncluded ? 0 : electricityCost.value) + (props.waterIncluded ? 0 : waterCost.value)
})

const energyRanking = computed(() => {
  const rows = props.devices
    .map((d) => ({ name: d.name, kwh: deviceMonthlyKwh(d) }))
    .sort((a, b) => b.kwh - a.kwh)
  const total = rows.reduce((sum, r) => sum + r.kwh, 0) || 1
  return rows.map((r) => ({ ...r, percent: Math.round((r.kwh / total) * 100) }))
})

const waterRanking = computed(() => {
  const rows = props.waterActivities
    .map((a) => ({ name: a.name, liters: activityMonthlyLiters(a) }))
    .sort((a, b) => b.liters - a.liters)
  const total = rows.reduce((sum, r) => sum + r.liters, 0) || 1
  return rows.map((r) => ({ ...r, percent: Math.round((r.liters / total) * 100) }))
})
</script>

<template>
  <div class="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
    <h3 class="text-lg font-semibold text-[#0F172A]">Analisis Penggunaanmu</h3>
    <p class="mt-1 text-xs font-medium uppercase tracking-wide text-[#64748B]">Estimasi</p>

    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <Zap class="h-4 w-4 text-[#F59E0B]" />
        <p class="mt-2 text-xl font-bold text-[#0F172A]">{{ formatNumber(totalKwh) }} kWh</p>
        <p class="text-xs text-[#64748B]">Estimasi listrik / bulan</p>
      </div>
      <div class="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <Droplet class="h-4 w-4 text-[#3B82F6]" />
        <p class="mt-2 text-xl font-bold text-[#0F172A]">{{ formatNumber(totalLiters, 0) }} L</p>
        <p class="text-xs text-[#64748B]">Estimasi air / bulan</p>
      </div>
      <div class="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <Wallet class="h-4 w-4 text-[#16A34A]" />
        <p v-if="electricityIncluded && waterIncluded" class="mt-2 text-base font-bold text-[#0F172A]">
          Sudah termasuk kost
        </p>
        <p v-else class="mt-2 text-xl font-bold text-[#0F172A]">{{ formatRupiah(totalCost) }}</p>
        <p class="text-xs text-[#64748B]">Estimasi biaya / bulan</p>
      </div>
    </div>

    <div v-if="energyRanking.length" class="mt-6">
      <p class="text-sm font-semibold text-[#0F172A]">Top Energy Consumers</p>
      <div class="mt-3 space-y-3">
        <div v-for="(row, i) in energyRanking" :key="row.name">
          <div class="flex items-center justify-between text-sm">
            <span class="text-[#0F172A]">{{ String(i + 1).padStart(2, '0') }} — {{ row.name }}</span>
            <span class="text-[#64748B]">{{ formatNumber(row.kwh) }} kWh · {{ row.percent }}%</span>
          </div>
          <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div class="h-full rounded-full bg-[#F59E0B]" :style="{ width: row.percent + '%' }" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="waterRanking.length" class="mt-6">
      <p class="text-sm font-semibold text-[#0F172A]">Top Water Usage</p>
      <div class="mt-3 space-y-3">
        <div v-for="row in waterRanking" :key="row.name">
          <div class="flex items-center justify-between text-sm">
            <span class="text-[#0F172A]">{{ row.name }}</span>
            <span class="text-[#64748B]">{{ row.percent }}%</span>
          </div>
          <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div class="h-full rounded-full bg-[#3B82F6]" :style="{ width: row.percent + '%' }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>