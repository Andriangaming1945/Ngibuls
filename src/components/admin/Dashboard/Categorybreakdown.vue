<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
})

const PALETTE = ['#16A34A', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']

const totalDevices = computed(() => props.categories.reduce((sum, c) => sum + c.count, 0))
const topCategory = computed(() => props.categories[0] || null)
const maxCount = computed(() => Math.max(1, ...props.categories.map((c) => c.count)))

// Skala sumbu-y dibulatkan ke atas biar ada headroom di atas bar tertinggi,
// gak nempel pas-pasan di puncak grafik.
const axisMax = computed(() => {
  const raw = maxCount.value
  if (raw <= 5) return raw + 1
  const step = Math.pow(10, Math.floor(Math.log10(raw)))
  return Math.ceil(raw / step) * step + step
})

const axisTicks = computed(() => {
  const steps = 4
  return Array.from({ length: steps + 1 }, (_, i) => Math.round((axisMax.value / steps) * (steps - i)))
})

const chartBars = computed(() =>
  props.categories.map((c, i) => ({
    category: c.category,
    count: c.count,
    color: PALETTE[i % PALETTE.length],
    heightPercent: Math.round((c.count / axisMax.value) * 100),
  }))
)

const animatedHeights = ref({})

async function playGrowAnimation() {
  const zeroed = {}
  chartBars.value.forEach((b) => {
    zeroed[b.category] = 0
  })
  animatedHeights.value = zeroed

  await nextTick()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targets = {}
      chartBars.value.forEach((b) => {
        targets[b.category] = b.heightPercent
      })
      animatedHeights.value = targets
    })
  })
}

onMounted(playGrowAnimation)
watch(chartBars, playGrowAnimation)
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
    <h3 class="mt-1.5 pl-3 text-sm font-semibold text-[#0F172A]">Perangkat per Kategori</h3>

    <div v-if="!categories.length" class="mt-4 text-sm text-slate-400">Belum ada data perangkat.</div>

    <template v-else>
      <!-- Chart bar dengan grid horizontal -->
      <div class="relative mt-6 h-56 px-2">
        <!-- Garis grid + label sumbu-y -->
        <div class="absolute inset-0 flex flex-col justify-between">
          <div v-for="tick in axisTicks" :key="tick" class="flex items-center gap-2">
            <span class="w-5 shrink-0 text-right text-[10px] text-slate-400">{{ tick }}</span>
            <span class="h-px w-full bg-slate-100" />
          </div>
        </div>

        <!-- Bar-bar, dipusatkan dan lebarnya tetap biar gak ngambang kosong -->
        <div class="relative flex h-full items-end justify-center gap-10">
          <div
            v-for="b in chartBars"
            :key="b.category"
            class="flex h-full w-16 flex-col items-center justify-end gap-2"
          >
            <span class="text-xs font-semibold text-[#0F172A]">{{ b.count }}</span>
            <div class="flex h-full w-full items-end overflow-hidden rounded-t-lg bg-slate-50">
              <div
                class="w-full rounded-t-lg transition-[height] duration-700 ease-out"
                :style="{
                  height: (animatedHeights[b.category] ?? 0) + '%',
                  backgroundColor: b.color,
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Label kategori, sejajar dengan tiap bar -->
      <div class="mt-2 flex justify-center gap-10 border-t border-slate-100 pt-2 pl-7">
        <span v-for="b in chartBars" :key="b.category" class="w-16 truncate text-center text-xs font-medium text-slate-600">
          {{ b.category }}
        </span>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-slate-50 p-4">
          <p class="text-xs text-slate-500">Total Kategori</p>
          <p class="mt-1 text-lg font-bold text-[#0F172A]">{{ categories.length }}</p>
        </div>
        <div v-if="topCategory" class="rounded-xl bg-slate-50 p-4">
          <p class="text-xs text-slate-500">Kategori Terbanyak</p>
          <p class="mt-1 truncate text-lg font-bold text-[#0F172A]">{{ topCategory.category }}</p>
          <p class="text-xs text-slate-500">{{ topCategory.count }} perangkat</p>
        </div>
      </div>
    </template>
  </div>
</template>