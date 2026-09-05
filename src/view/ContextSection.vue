<script setup>
import { Zap, Droplets, TrendingUp } from 'lucide-vue-next'
import { useScrollReveal } from '../composables/useScrollReveal'

const { target, isVisible } = useScrollReveal()
</script>

<template>
  <section  id="analisis" class="relative bg-[#F8FAFC]">
    <div
      ref="target"
      class="relative mx-auto max-w-[1280px] px-4 pb-24 pt-16 transition-all duration-700 ease-out sm:px-6 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24"
      :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
    >
      <div class="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <!-- Kiri: heading + copy -->
        <div class="max-w-xl">
          <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#16A34A]">
            Kenapa Ini Penting
          </span>

          <h2 class="mt-4 text-[32px] font-bold leading-[1.1] tracking-tight text-[#0F172A] sm:text-[40px] lg:text-[52px]">
            Biaya Kecil yang<br />Terus Bertambah.
          </h2>

          <p class="mt-6 text-base leading-relaxed text-[#64748B] sm:text-lg">
            Listrik dan air digunakan setiap hari, tetapi sering kali kita tidak menyadari bagaimana kebiasaan kecil memengaruhi pengeluaran bulanan.
          </p>

          <p class="mt-4 text-base leading-relaxed text-[#64748B] sm:text-lg">
            Perangkat yang menyala terlalu lama, penggunaan air yang berlebihan, atau kebiasaan sehari-hari yang kurang efisien dapat membuat pengeluaran terus meningkat. Tanpa mengetahui sumber penggunaan terbesar, kita sering kesulitan menentukan apa yang perlu diubah.
          </p>

          <div class="mt-8 border-l-2 border-[#16A34A] pl-5">
            <p class="text-lg font-semibold leading-snug text-[#0F2747] sm:text-xl">
              Bukan hanya mengetahui berapa yang kita bayar, tetapi memahami apa yang membuatnya mahal.
            </p>
          </div>
        </div>

        <!-- Kanan: visual cards -->
        <div class="flex flex-col gap-5">
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.08)]">
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B]/10">
                <Zap class="h-5 w-5 text-[#F59E0B]" />
              </span>
              <div>
                <p class="text-sm font-semibold text-[#0F172A]">Electricity</p>
                <p class="text-xs text-[#64748B]">Used Every Day</p>
              </div>
            </div>
            <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-[#F59E0B] transition-[width] duration-[1200ms] ease-out"
                :style="{ width: isVisible ? '72%' : '0%' }"
              />
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.08)]">
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B82F6]/10">
                <Droplets class="h-5 w-5 text-[#3B82F6]" />
              </span>
              <div>
                <p class="text-sm font-semibold text-[#0F172A]">Water</p>
                <p class="text-xs text-[#64748B]">Used Every Day</p>
              </div>
            </div>
            <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-[#3B82F6] transition-[width] duration-[1200ms] ease-out delay-150"
                :style="{ width: isVisible ? '58%' : '0%' }"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 pl-1 pt-2">
            <TrendingUp class="h-4 w-4 text-[#16A34A]" />
            <p class="text-sm font-medium text-[#64748B]">Sedikit demi sedikit, biaya bertambah.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>