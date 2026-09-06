<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { handleOAuthCallback } = useAuth()
const message = ref('Memproses login dengan Google...')

onMounted(async () => {
  try {
    const result = await handleOAuthCallback()
    router.replace(result.redirect)
  } catch (e) {
    if (e.message === '__NOT_REGISTERED__') {
      message.value = 'Akun belum terdaftar. Silakan daftar terlebih dahulu.'
      setTimeout(() => router.replace('/register'), 1500)
    } else {
      message.value = e.message || 'Terjadi kesalahan saat login dengan Google'
      setTimeout(() => router.replace('/login'), 1500)
    }
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 text-center">
    <p class="text-sm text-[#64748B]">{{ message }}</p>
  </div>
</template>