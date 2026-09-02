<script setup>
import { ref, watch, computed } from 'vue'
import { deviceMonthlyKwh, activityMonthlyLiters, formatNumber, formatRupiah } from '@/composables/energyCalculations'

const props = defineProps({
  // { type: 'device' | 'water', name, monthlyCost, raw }
  contributor: { type: Object, required: true },
  tariffElectricity: { type: Number, required: true },
  tariffWater: { type: Number, required: true },
})

const isDevice = computed(() => props.contributor.type === 'device')

const simulatedValue = ref(
  isDevice.value ? props.contributor.raw.hoursPerDay : props.contributor.raw.minutes
)

watch(
  () => props.contributor,
  (c) => {
    simulatedValue.value = c.type === 'device' ? c.raw.hoursPerDay : c.raw.minutes
  }
)

const beforeAmount = computed(() =>
  isDevice.value ? deviceMonthlyKwh(props.contributor.raw) : activityMonthlyLiters(props.contributor.raw)
)

const afterAmount = computed(() => {
  if (isDevice.value) {
    return deviceMonthlyKwh({ ...props.contributor.raw, hoursPerDay: simulatedValue.value })
  }
  return activityMonthlyLiters({ ...props.contributor.raw, minutes: simulatedValue.value })
})

const beforeCost = computed(() =>
  isDevice.value ? beforeAmount.value * props.tariffElectricity : (beforeAmount.value / 1000) * props.tariffWater
)
const afterCost = computed(() =>
  isDevice.value ? afterAmount.value * props.tariffElectricity : (afterAmount.value / 1000) * props.tariffWater
)

const savingAmount = computed(() => Math.max(0, beforeAmount.value - afterAmount.value))
const savingCost = computed(() => Math.max(0, beforeCost.value - afterCost.value))

const sliderMax = computed(() => (isDevice.value ? 24 : 60))
const unitLabel = computed(() => (isDevice.value ? 'jam / hari' : 'menit'))
const amountUnit = computed(() => (isDevice.value ? 'kWh/bulan' : 'liter/bulan'))
</script>

<template>
  <div class="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
    <h3 class="text-lg font-semibold text-[#0F172A]">Bagaimana Kalau Kamu Mengubah Kebiasaan?</h3>

    <div class="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <p class="text-sm font-semibold text-[#0F172A]">{{ contributor.name }}</p>
      <p class="text-xs text-[#64748B]">
        Sekarang: {{ isDevice ? `${contributor.raw.hoursPerDay} jam / hari` : `${contributor.raw.minutes} menit` }}
      </p>

      <div class="mt-3">
        <label class="text-sm font-medium text-[#0F172A]">Ubah menjadi ({{ unitLabel }})</label>
        <input
          v-model.number="simulatedValue"
          type="range"
          min="0"
          :max="sliderMax"
          step="1"
          class="mt-2 w-full accent-[#16A34A]"
        />
        <p class="mt-1 text-sm font-semibold text-[#16A34A]">{{ simulatedValue }} {{ unitLabel }}</p>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-lg bg-white p-3">
          <p class="text-xs text-[#64748B]">Before</p>
          <p class="font-semibold text-[#0F172A]">{{ formatNumber(beforeAmount) }} {{ amountUnit }}</p>
        </div>
        <div class="rounded-lg bg-white p-3">
          <p class="text-xs text-[#64748B]">After</p>
          <p class="font-semibold text-[#0F172A]">{{ formatNumber(afterAmount) }} {{ amountUnit }}</p>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-4 text-sm">
        <p class="text-[#16A34A]">Potential saving: {{ formatNumber(savingAmount) }} {{ amountUnit }}</p>
        <p class="text-[#16A34A]">Estimasi hemat biaya: {{ formatRupiah(savingCost) }}</p>
      </div>
    </div>
  </div>
</template>