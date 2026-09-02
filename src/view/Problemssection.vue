<script setup>
import { Zap, Droplets, Wallet, Target, ArrowDown, ChevronDown } from 'lucide-vue-next'
import { useScrollReveal } from '../composables/useScrollReveal'

const { target, isVisible } = useScrollReveal()

const problems = [
  {
    id: '01',
    icon: Zap,
    iconColor: '#F59E0B',
    iconBg: 'bg-[#F59E0B]/10',
    title: 'Tidak Tahu Perangkat yang Paling Boros',
    description:
      'AC, rice cooker, dispenser, laptop, dan berbagai perangkat lain digunakan setiap hari. Namun, pengguna sering tidak mengetahui perangkat mana yang paling banyak berkontribusi terhadap konsumsi listrik.',
    visual: { type: 'bar', label: 'AC', value: 42, color: '#F59E0B' },
  },
  {
    id: '02',
    icon: Droplets,
    iconColor: '#3B82F6',
    iconBg: 'bg-[#3B82F6]/10',
    title: 'Tidak Menyadari Pola Penggunaan Air',
    description:
      'Penggunaan air terjadi melalui banyak aktivitas sederhana seperti mandi, mencuci, dan membersihkan. Karena dilakukan secara rutin, pemborosan sering tidak terasa.',
    visual: { type: 'bar', label: 'Mandi', value: 58, color: '#3B82F6' },
  },
  {
    id: '03',
    icon: Wallet,
    iconColor: '#0F2747',
    iconBg: 'bg-[#0F2747]/5',
    title: 'Hanya Melihat Total Biaya',
    description:
      'Pengguna biasanya hanya melihat total tagihan atau biaya yang harus dibayar tanpa mengetahui sumber penggunaan terbesar di balik angka tersebut.',
    visual: { type: 'total', amount: 'Rp875.000', note: 'Kenapa bisa segini?' },
  },
  {
    id: '04',
    icon: Target,
    iconColor: '#0F2747',
    iconBg: 'bg-[#0F2747]/5',
    title: 'Tidak Tahu Harus Mulai dari Mana',
    description:
      'Banyak tips menghemat listrik dan air tersedia, tetapi rekomendasi yang diberikan sering bersifat umum dan belum tentu sesuai dengan kebiasaan atau kondisi pengguna.',
    visual: { type: 'tips' },
  },
]
</script>

<template>
  <section class="py-24 sm:py-28 lg:py-32 bg-[#F8FAFC]">
    <div ref="target" class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div
        class="mx-auto max-w-2xl text-center transition-all duration-700 ease-out"
        :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <h2 class="text-[32px] font-bold leading-[1.15] tracking-tight text-[#0F172A] sm:text-[40px] lg:text-[48px]">
          Sebenarnya, Apa yang Membuat Biaya Membengkak?
        </h2>
        <p class="mt-4 text-base text-[#64748B] sm:text-lg">
          Banyak pengguna ingin berhemat, tetapi sulit mengetahui apa yang harus diubah terlebih dahulu.
        </p>
      </div>

      <div class="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        <div
          v-for="(problem, i) in problems"
          :key="problem.id"
          class="group rounded-2xl border border-slate-200/70 bg-white p-8 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_12px_28px_-10px_rgba(15,23,42,0.12)]"
          :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
          :style="{ transitionDelay: isVisible ? `${i * 100}ms` : '0ms' }"
        >
          <div class="flex items-start justify-between">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl" :class="problem.iconBg">
              <component :is="problem.icon" class="h-5 w-5" :style="{ color: problem.iconColor }" />
            </span>
            <span class="font-mono text-xs font-medium text-slate-300">{{ problem.id }}</span>
          </div>

          <h3 class="mt-5 text-[22px] font-bold leading-snug text-[#0F172A] sm:text-[24px]">
            {{ problem.title }}
          </h3>
          <p class="mt-3 text-[15px] leading-relaxed text-[#64748B]">
            {{ problem.description }}
          </p>

          <div class="mt-6 rounded-xl bg-slate-50 p-4">
            <template v-if="problem.visual.type === 'bar'">
              <div class="flex items-center justify-between text-xs font-medium text-[#64748B]">
                <span>{{ problem.visual.label }}</span>
                <span :style="{ color: problem.visual.color }">{{ problem.visual.value }}%</span>
              </div>
              <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  class="h-full rounded-full transition-[width] duration-1000 ease-out"
                  :style="{
                    width: isVisible ? problem.visual.value + '%' : '0%',
                    backgroundColor: problem.visual.color,
                  }"
                />
              </div>
            </template>

            <template v-else-if="problem.visual.type === 'total'">
              <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
              <p class="mt-1 text-2xl font-bold text-[#0F172A]">{{ problem.visual.amount }}</p>
              <p class="mt-1 text-xs text-[#64748B]">{{ problem.visual.note }}</p>
            </template>

            <template v-else-if="problem.visual.type === 'tips'">
              <div class="flex items-center gap-3">
                <span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-[#64748B]">Tips umum</span>
                <ArrowDown class="h-4 w-4 text-slate-300" />
                <span class="rounded-full bg-[#0F2747]/5 px-3 py-1 text-xs font-semibold text-[#0F2747]">?</span>
              </div>
            </template>
          </div>
        </div>
      </div>

    
    </div>
  </section>
</template>