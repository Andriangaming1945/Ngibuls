<script setup>
import { useAuth } from '@/composables/useAuth'
import AppSidebar from '@/components/sidebar.vue'
import ProfileAvatarCard from '@/components/profile/ProfileAvatarCard.vue'
import BasicInfoForm from '@/components/profile/BasicInfoForm.vue'
import RecommendationHistory from '@/components/profile/RecommendationHistory.vue'
import { Loader2 } from 'lucide-vue-next'

const { profile, authLoading } = useAuth()
</script>

<template>
  <div class="relative min-h-screen bg-[#F8FAFC]">
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#4CAF50]/[0.06] blur-[120px]" />
      <div class="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[#0EA5E9]/[0.06] blur-[120px]" />
    </div>

    <div class="relative z-10 lg:flex">
      <AppSidebar active-key="profil" />

      <main class="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div class="mx-auto max-w-3xl">
          <div v-if="authLoading || !profile" class="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 class="h-4 w-4 animate-spin" />
            Memuat profil...
          </div>

          <template v-else>
            <div class="reveal" style="--delay: 0ms">
              <p class="text-xs font-semibold uppercase tracking-wider text-[#4CAF50]">Akun Saya</p>
              <h1 class="mt-1 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">Profil</h1>
              <p class="mt-1.5 text-sm text-slate-500">Kelola data akun dan preferensi hemat energi kamu.</p>
            </div>

            <ProfileAvatarCard class="mt-6" />
            <BasicInfoForm />
            <RecommendationHistory />
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  animation: fadeSlideUp 0.5s ease-out both;
  animation-delay: var(--delay, 0ms);
}
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    animation: none;
  }
}
</style>