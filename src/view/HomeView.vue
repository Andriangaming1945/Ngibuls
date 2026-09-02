<script setup>
import Navbar from '../components/Navbar.vue'
import ContextSection from './ContextSection.vue'
import ProblemsSection from './Problemssection.vue'
import SolutionSection from '../components/user/Solutionsection.vue'
import ChangeSection from './Mengubah.vue'
import PotentialSavingSection from './PotentialSavingSection.vue'
import backgroundImg from '../assets/img/background.jpeg'
import Footer from '../components/Footer.vue'
import { Zap, ArrowRight, PlayCircle } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-[#0F172A]">
    <Navbar />

    <section class="relative min-h-screen overflow-hidden">
      <!-- Full-bleed background: forced to true viewport width via left-1/2 + w-screen,
           so it always covers edge-to-edge no matter how wide any parent/ancestor is. -->
      <div class="absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2">
        <img :src="backgroundImg" alt="Panorama kota" class="h-full w-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-br from-[#0F2747]/95 via-[#0F2747]/85 to-[#163A5F]/75" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
      </div>

      <!-- Papan sirkuit animasi: garis jalur + titik cahaya yang mengalir mengikuti jalur -->
      <svg
        class="pointer-events-none absolute inset-y-0 left-1/2 z-[1] h-full w-screen -translate-x-1/2"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g fill="none" stroke="white" stroke-width="1.4" opacity="0.16">
          <path id="path1" d="M100,150 H420 V320 H760 V150 H1100" />
          <path id="path2" d="M1500,90 H1180 V260 H900 V480" />
          <path id="path3" d="M60,620 H340 V780 H700" />
          <path id="path4" d="M1540,720 H1240 V560 H980 V820 H760" />
          <path id="path5" d="M500,60 V220 H260 V420" />
        </g>

        <g fill="white" opacity="0.25">
          <circle cx="420" cy="150" r="3.5" />
          <circle cx="760" cy="320" r="3.5" />
          <circle cx="1180" cy="260" r="3.5" />
          <circle cx="900" cy="260" r="3.5" />
          <circle cx="340" cy="620" r="3.5" />
          <circle cx="340" cy="780" r="3.5" />
          <circle cx="1240" cy="720" r="3.5" />
          <circle cx="980" cy="560" r="3.5" />
          <circle cx="500" cy="220" r="3.5" />
          <circle cx="260" cy="220" r="3.5" />
        </g>

        <circle r="4" fill="#4ADE80" filter="url(#glow)">
          <animateMotion dur="3.2s" repeatCount="indefinite" rotate="auto">
            <mpath href="#path1" />
          </animateMotion>
        </circle>
        <circle r="3.5" fill="#F59E0B" filter="url(#glow)">
          <animateMotion dur="4.1s" repeatCount="indefinite" rotate="auto">
            <mpath href="#path2" />
          </animateMotion>
        </circle>
        <circle r="3.5" fill="#4ADE80" filter="url(#glow)">
          <animateMotion dur="2.6s" repeatCount="indefinite" rotate="auto">
            <mpath href="#path3" />
          </animateMotion>
        </circle>
        <circle r="3.5" fill="#3B82F6" filter="url(#glow)">
          <animateMotion dur="4.6s" repeatCount="indefinite" rotate="auto">
            <mpath href="#path4" />
          </animateMotion>
        </circle>
        <circle r="3" fill="#F59E0B" filter="url(#glow)">
          <animateMotion dur="3.6s" repeatCount="indefinite" rotate="auto">
            <mpath href="#path5" />
          </animateMotion>
        </circle>
      </svg>

      <div class="circuit-layer circuit-layer--near pointer-events-none absolute inset-y-0 left-1/2 z-[1] w-screen -translate-x-1/2" />
      <div class="circuit-layer circuit-layer--far pointer-events-none absolute inset-y-0 left-1/2 z-[1] w-screen -translate-x-1/2" />

      <div class="pointer-events-none absolute -left-24 bottom-0 z-[1] h-[420px] w-[420px] rounded-full bg-[#16A34A]/20 blur-[100px]" />

      <div class="relative z-10">
        <div class="mx-auto flex min-h-[calc(100vh-6rem)] max-w-[1280px] flex-col justify-center px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
          <div class="max-w-[640px] animate-[fadeInUp_0.7s_ease-out_forwards]">
            <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-sm">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-75"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]"></span>
              </span>
              <Zap class="h-3.5 w-3.5 text-[#16A34A]" />
              <span class="text-xs font-medium text-white/80">Pantau listrik & air secara real-time</span>
            </div>

            <h1 class="text-[40px] font-bold leading-[1.05] tracking-tight text-white sm:text-[56px] lg:text-[68px]">
              Tahu Ke Mana
              <span class="relative inline-block text-[#4ADE80]">
                Biaya Energimu
                <svg class="absolute -bottom-1 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none">
                  <path d="M0,6 Q50,0 100,5 T200,4" fill="none" stroke="#16A34A" stroke-width="4" stroke-linecap="round" opacity="0.7" />
                </svg>
              </span>
              Pergi?
            </h1>

            <p class="mt-6 max-w-[550px] text-base leading-relaxed text-white/65 sm:text-lg">
              Ngibuls membantu kamu menganalisis penggunaan listrik dan air, menemukan sumber pemborosan, dan mendapatkan rekomendasi penghematan yang sesuai dengan kebiasaanmu.
            </p>

            <div class="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button class="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(22,163,74,0.6)] transition-colors hover:bg-[#128a3e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]">
                Mulai Sekarang
                <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              
            </div>

            <div class="mt-8 flex items-center gap-2 text-xs font-medium tracking-wide text-white/45">
              <span>Temukan</span>
              <span class="h-1 w-1 rounded-full bg-[#16A34A]"></span>
              <span>Pahami</span>
              <span class="h-1 w-1 rounded-full bg-[#16A34A]"></span>
              <span>Hemat</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <main>
      <ContextSection />
      <ProblemsSection />
      <SolutionSection />
      <ChangeSection />
      <PotentialSavingSection />
      <Footer />
    </main>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.circuit-layer--near {
  opacity: 0.07;
  background-repeat: repeat;
  background-size: 120px 120px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M0 60H40V20H80' fill='none' stroke='white' stroke-width='1'/%3E%3Cpath d='M120 60H80V100H40' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='40' cy='20' r='2.5' fill='white'/%3E%3Ccircle cx='80' cy='100' r='2.5' fill='white'/%3E%3C/svg%3E");
  animation: driftNear 16s linear infinite;
}

.circuit-layer--far {
  opacity: 0.045;
  background-repeat: repeat;
  background-size: 220px 220px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cpath d='M0 110H70V40H150' fill='none' stroke='white' stroke-width='1'/%3E%3Cpath d='M220 110H150V180H70' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='70' cy='40' r='3' fill='white'/%3E%3Ccircle cx='150' cy='180' r='3' fill='white'/%3E%3C/svg%3E");
  animation: driftFar 28s linear infinite;
}

@keyframes driftNear {
  from { background-position: 0 0; }
  to { background-position: 120px 120px; }
}

@keyframes driftFar {
  from { background-position: 0 0; }
  to { background-position: -220px 110px; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
</style>