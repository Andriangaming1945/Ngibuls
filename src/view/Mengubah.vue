<script setup>
import { Search, Target, SlidersHorizontal, Zap, Droplet } from 'lucide-vue-next'
import { useScrollReveal } from '../composables/useScrollReveal'

const { target, isVisible } = useScrollReveal()

const valuePoints = [
  {
    number: '01',
    icon: Search,
    title: 'Temukan',
    desc: 'Ketahui perangkat dan aktivitas mana yang paling menyumbang biaya listrik dan airmu — bukan cuma lihat total tagihan.',
  },
  {
    number: '02',
    icon: Target,
    title: 'Prioritaskan',
    desc: 'Dapatkan 3 tindakan yang paling berdampak, disesuaikan dengan kemampuanmu — tanpa beli alat baru, biaya rendah, atau investasi alat.',
  },
  {
    number: '03',
    icon: SlidersHorizontal,
    title: 'Simulasikan',
    desc: 'Coba dulu sebelum benar-benar mengubah kebiasaan, misalnya AC dari 8 jadi 6 jam sehari, dan lihat langsung potensi hematnya.',
  },
]

const costSources = [
  { icon: Zap, label: 'AC', amount: 'Rp128.000', percent: 42, color: '#F59E0B' },
  { icon: Droplet, label: 'Mandi', amount: 'Rp63.000', percent: 28, color: '#3B82F6' },
  { icon: Zap, label: 'Rice Cooker', amount: 'Rp42.000', percent: 18, color: '#F59E0B' },
]
</script>

<template>
  <section id="rekomendasi" class="relative bg-[#F8FAFC]">
    <div
      ref="target"
      class="relative mx-auto max-w-[1280px] px-4 py-20 transition-all duration-700 ease-out sm:py-24"
      :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
    >
      <!-- Eyebrow + heading, centered -->
      <div class="mx-auto max-w-2xl text-center">
        <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#16A34A]">
          Cost Detective
        </span>

        <h2 class="mt-4 text-[32px] font-bold leading-[1.1] tracking-tight text-[#0F172A] sm:text-4xl">
          Ubah Angka Menjadi Insight.
        </h2>

        <p class="mt-6 text-base leading-relaxed text-[#64748B] sm:text-lg">
          Bukan sekadar menghitung tagihan. Ngibuls membantu kamu, penghuni
          kost, mengetahui apa yang membuat biaya listrik dan airmu mahal —
          dan perubahan apa yang paling berdampak untuk kamu ubah duluan.
        </p>
      </div>

      <!-- Value points: editorial index row, full container width -->
      <div class="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 sm:divide-x sm:divide-slate-200">
        <div
          v-for="point in valuePoints"
          :key="point.number"
          class="relative sm:px-8 sm:first:pl-0 sm:last:pr-0"
        >
          <span class="pointer-events-none block text-6xl font-black leading-none text-slate-900/[0.05] sm:text-7xl">
            {{ point.number }}
          </span>

          <div class="-mt-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F2747]/5 sm:-mt-8">
            <component :is="point.icon" class="h-5 w-5 text-[#0F2747]" />
          </div>

          <h3 class="mt-4 text-base font-semibold text-[#0F172A]">
            {{ point.title }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-[#64748B]">
            {{ point.desc }}
          </p>
        </div>
      </div>

      <!-- Product mockup: centered, layered accent, symmetric within the container -->
      <div class="relative mx-auto mt-20 max-w-[640px] sm:mt-24">
        <!-- accent block behind, offset but fully inside the container's own margin -->
        <div
          class="absolute -left-3 -top-3 hidden h-full w-full rounded-2xl bg-[#F0FDF4] sm:block"
          aria-hidden="true"
        />

        <div class="relative rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs font-semibold uppercase tracking-[0.15em] text-[#64748B]">
                Estimasi Biaya Bulan Ini
              </span>
              <p class="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
                Rp387.000
              </p>
            </div>
            <span class="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-[#64748B]">
              Example Analysis
            </span>
          </div>

          <div class="mt-8">
            <span class="text-xs font-semibold uppercase tracking-[0.15em] text-[#64748B]">
              Sumber Biaya Terbesar
            </span>

            <div class="mt-4 flex flex-col gap-4">
              <div v-for="source in costSources" :key="source.label + source.amount">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <component :is="source.icon" class="h-4 w-4" :style="{ color: source.color }" />
                    <span class="text-sm font-medium text-[#0F172A]">{{ source.label }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-[#64748B]">{{ source.amount }}</span>
                    <span class="text-sm font-semibold text-[#0F172A]">{{ source.percent }}%</span>
                  </div>
                </div>
                <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full"
                    :style="{ width: source.percent + '%', backgroundColor: source.color }"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="my-7 h-px w-full bg-slate-100" />

          <div>
            <span class="text-xs font-semibold uppercase tracking-[0.15em] text-[#64748B]">
              Prioritas Penghematan
            </span>

            <div class="mt-3 flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-[#0F172A]">Kurangi penggunaan AC</p>
                <p class="text-sm text-[#64748B]">2 jam / hari</p>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between rounded-xl bg-[#F0FDF4] px-4 py-3">
              <span class="text-sm font-medium text-[#16A34A]">Potential Saving</span>
              <span class="text-sm font-bold text-[#16A34A]">+ Rp56.000 / bulan</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Closing statement: centered, same width as the heading above -->
      <div class="mx-auto mt-14 max-w-xl text-center sm:mt-16">
        <p class="text-xl font-semibold leading-snug tracking-tight text-[#0F172A] sm:text-2xl">
          Dari &ldquo;Saya bayar berapa?&rdquo; menjadi
          &ldquo;Saya tahu apa yang harus saya ubah.&rdquo;
        </p>
      </div>
    </div>
  </section>
</template>