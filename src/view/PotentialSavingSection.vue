<script setup>
import { ref, computed } from 'vue'
import { Zap, Droplet, ArrowRight, TrendingDown } from 'lucide-vue-next'
import { useScrollReveal } from '../composables/useScrollReveal'

const { target, isVisible } = useScrollReveal()

// Electricity — interactive what-if simulator
// Baseline: AC 8 jam/hari = Rp278.000/bulan (dari brainstorming)
const AC_BASELINE_HOURS = 8
const AC_BASELINE_COST = 278000

const acHours = ref(6)

const acCost = computed(() => {
  const raw = (AC_BASELINE_COST / AC_BASELINE_HOURS) * acHours.value
  return Math.round(raw / 1000) * 1000
})

const acSaving = computed(() => AC_BASELINE_COST - acCost.value)
const acUsagePercent = computed(() => Math.round((acHours.value / 12) * 100))

function formatRupiah(value) {
  return 'Rp' + Math.abs(value).toLocaleString('id-ID')
}
</script>

<template>
  <section class="relative bg-[#F8FAFC]">
    <div
      ref="target"
      class="relative mx-auto max-w-[1280px] px-4 py-20 transition-all duration-700 ease-out sm:py-24"
      :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
    >
      <div class="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-20">
        <!-- LEFT -->
        <div class="order-1 max-w-xl lg:sticky lg:top-24">
          <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#16A34A]">
            What-if Simulation
          </span>

          <h2 class="mt-4 text-[40px] font-bold leading-[1.05] tracking-tight text-[#0F172A] lg:text-[56px]">
            Perubahan Kecil,<br />Dampak yang Terlihat.
          </h2>

          <p class="mt-6 text-base leading-relaxed text-[#64748B] lg:text-lg">
            Coba ubah kebiasaanmu dan lihat bagaimana perbedaannya terhadap
            penggunaan serta estimasi biaya.
          </p>

          <p class="mt-4 text-sm leading-relaxed text-[#64748B]">
            Simulasi di samping ini menggunakan skenario umum penghuni kost —
            bukan data akun kamu.
          </p>
        </div>

        <!-- RIGHT: simulation panels -->
        <div class="order-2 flex flex-col gap-6">
          <!-- Electricity panel — interactive -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Zap class="h-4 w-4 text-[#F59E0B]" />
                <span class="text-xs font-semibold uppercase tracking-[0.15em] text-[#64748B]">
                  Electricity
                </span>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-[#64748B]">
                Example Simulation
              </span>
            </div>

            <div class="mt-6 flex items-center justify-between gap-4">
              <div>
                <p class="text-sm text-[#64748B]">Before</p>
                <p class="mt-1 text-sm font-semibold text-[#0F172A]">
                  AC · {{ AC_BASELINE_HOURS }} jam / hari
                </p>
                <p class="text-sm text-[#64748B]">{{ formatRupiah(AC_BASELINE_COST) }} / bulan</p>
              </div>

              <ArrowRight class="h-4 w-4 shrink-0 text-slate-300" />

              <div class="text-right">
                <p class="text-sm text-[#64748B]">Now</p>
                <Transition name="fade-swap" mode="out-in">
                  <p :key="acHours" class="mt-1 text-sm font-semibold text-[#0F172A]">
                    AC · {{ acHours }} jam / hari
                  </p>
                </Transition>
                <Transition name="fade-swap" mode="out-in">
                  <p :key="acCost" class="text-sm text-[#64748B]">
                    {{ formatRupiah(acCost) }} / bulan
                  </p>
                </Transition>
              </div>
            </div>

            <!-- simple usage meter -->
            <div class="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-[#F59E0B] transition-all duration-300 ease-out"
                :style="{ width: acUsagePercent + '%' }"
              />
            </div>

            <!-- slider -->
            <div class="mt-6">
              <div class="flex items-center justify-between text-xs font-medium text-[#64748B]">
                <span>AC Usage</span>
                <span class="text-[#0F172A]">{{ acHours }} jam / hari</span>
              </div>
              <input
                v-model.number="acHours"
                type="range"
                min="2"
                max="12"
                step="1"
                class="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#F59E0B]"
              />
              <div class="mt-1 flex justify-between text-[11px] text-slate-400">
                <span>2 jam</span>
                <span>12 jam</span>
              </div>
            </div>

            <!-- potential saving -->
            <div
              class="mt-6 flex items-center justify-between rounded-xl px-4 py-3"
              :class="acSaving >= 0 ? 'bg-[#F0FDF4]' : 'bg-amber-50'"
            >
              <span
                class="text-sm font-medium"
                :class="acSaving >= 0 ? 'text-[#16A34A]' : 'text-[#F59E0B]'"
              >
                {{ acSaving >= 0 ? 'Potential Saving' : 'Additional Cost' }}
              </span>
              <Transition name="fade-swap" mode="out-in">
                <span
                  :key="acSaving"
                  class="text-sm font-bold"
                  :class="acSaving >= 0 ? 'text-[#16A34A]' : 'text-[#F59E0B]'"
                >
                  {{ acSaving >= 0 ? '+' : '−' }} {{ formatRupiah(acSaving) }} / bulan
                </span>
              </Transition>
            </div>
          </div>

          <!-- Water panel — illustrative, no hard cost claim -->
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Droplet class="h-4 w-4 text-[#3B82F6]" />
                <span class="text-xs font-semibold uppercase tracking-[0.15em] text-[#64748B]">
                  Water
                </span>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-[#64748B]">
                Example Simulation
              </span>
            </div>

            <div class="mt-6 flex items-center justify-between gap-4">
              <div>
                <p class="text-sm text-[#64748B]">Before</p>
                <p class="mt-1 text-sm font-semibold text-[#0F172A]">Mandi · 12 menit</p>
              </div>

              <ArrowRight class="h-4 w-4 shrink-0 text-slate-300" />

              <div class="text-right">
                <p class="text-sm text-[#64748B]">Now</p>
                <p class="mt-1 text-sm font-semibold text-[#0F172A]">Mandi · 9 menit</p>
              </div>
            </div>

            <div class="mt-5 flex items-center gap-2 rounded-xl bg-[#F0FDF4] px-4 py-3">
              <TrendingDown class="h-4 w-4 shrink-0 text-[#16A34A]" />
              <span class="text-sm font-medium text-[#16A34A]">
                Penggunaan air lebih rendah
              </span>
            </div>

            <p class="mt-4 text-sm leading-relaxed text-[#64748B]">
              Perubahan durasi penggunaan dapat membantu mengurangi konsumsi.
            </p>
          </div>
        </div>
      </div>

     
    </div>
  </section>
</template>

<style scoped>
.fade-swap-enter-active,
.fade-swap-leave-active {
  transition: opacity 0.2s ease;
}
.fade-swap-enter-from,
.fade-swap-leave-to {
  opacity: 0;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: #ffffff;
  border: 2px solid #f59e0b;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
}

input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: #ffffff;
  border: 2px solid #f59e0b;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
}
</style>