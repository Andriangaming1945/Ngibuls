<script setup>
import { computed } from 'vue'
import { Cloud, LogIn, CheckCircle2 } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const { profile } = useAuth()
const isLoggedIn = computed(() => !!profile.value)
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between"
    :class="isLoggedIn ? 'border-[#16A34A]/20 bg-[#16A34A]/[0.04]' : 'border-amber-200 bg-amber-50'"
  >
    <div class="flex items-start gap-3">
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        :class="isLoggedIn ? 'bg-[#16A34A]/15 text-[#16A34A]' : 'bg-amber-100 text-amber-600'"
      >
        <CheckCircle2 v-if="isLoggedIn" class="h-4.5 w-4.5" />
        <Cloud v-else class="h-4.5 w-4.5" />
      </span>
      <div>
        
        <p class="mt-0.5 text-sm text-[#64748B]">
          {{
            isLoggedIn
              ? 'Perangkat dan aktivitas air yang kamu tambahkan sudah tercatat di akunmu dan progres hematmu bisa dipantau kapan aja.'
              : 'Masuk atau daftar dulu biar riwayat pemakaian ini kesimpen dan bisa kamu bandingin progresnya bulan depan.'
          }}
        </p>
      </div>
    </div>

    <RouterLink
      v-if="!isLoggedIn"
      to="/login"
      class="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1E293B]"
    >
      <LogIn class="h-4 w-4" />
      Masuk & Simpan Riwayat
    </RouterLink>
  </div>
</template>