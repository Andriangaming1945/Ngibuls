<script setup>
import { ref } from 'vue'
import { ArrowLeft, Zap, Mail, CheckCircle2 } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const sent = ref(false)

function validate() {
  if (!email.value.trim()) return 'Email wajib diisi'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) return 'Format email tidak valid'
  return ''
}

async function handleSubmit() {
  errorMsg.value = ''
  const validationError = validate()
  if (validationError) {
    errorMsg.value = validationError
    return
  }

  loading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    sent.value = true
  } catch (e) {
    errorMsg.value = e.message || 'Gagal mengirim email reset password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 sm:px-6">
    <router-link
      to="/login"
      class="fixed left-4 top-4 z-20 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-2 text-sm font-medium text-[#0F172A] shadow-sm backdrop-blur transition-colors hover:bg-white lg:left-6 lg:top-6"
    >
      <ArrowLeft class="h-4 w-4" />
      Kembali ke login
    </router-link>

    <div class="w-full max-w-sm animate-[fadeInUp_0.5s_ease-out_forwards]">
      <router-link to="/" class="mb-8 flex items-center justify-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16A34A]/10">
          <Zap class="h-5 w-5 text-[#16A34A]" />
        </span>
        <span class="text-xl font-bold text-[#0F172A]">
          Ngi<span class="text-[#16A34A]">buls</span>
        </span>
      </router-link>

      <!-- State: belum kirim -->
      <template v-if="!sent">
        <h1 class="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">Lupa password?</h1>
        <p class="mt-2 text-sm leading-relaxed text-[#64748B]">
          Masukkan email akunmu, kami akan kirim link untuk atur ulang password.
        </p>

        <p v-if="errorMsg" class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ errorMsg }}
        </p>

        <form class="mt-7 flex flex-col gap-4" @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="text-sm font-medium text-[#0F172A]">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="nama@email.com"
              class="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 transition-shadow focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="mt-2 w-full rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(22,163,74,0.5)] transition-colors hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loading ? 'Mengirim...' : 'Kirim Link Reset' }}
          </button>
        </form>
      </template>

      <!-- State: sudah kirim -->
      <template v-else>
        <div class="flex flex-col items-center text-center">
          <span class="flex h-14 w-14 items-center justify-center rounded-full bg-[#16A34A]/10">
            <CheckCircle2 class="h-7 w-7 text-[#16A34A]" />
          </span>
          <h1 class="mt-5 text-2xl font-bold tracking-tight text-[#0F172A]">Cek email kamu</h1>
          <p class="mt-2 text-sm leading-relaxed text-[#64748B]">
            Link reset password sudah dikirim ke
            <span class="font-medium text-[#0F172A]">{{ email }}</span>. Buka email itu dan ikuti instruksinya.
          </p>
          <div class="mt-6 flex items-center gap-2 text-xs text-[#94A3B8]">
            <Mail class="h-3.5 w-3.5" />
            Tidak masuk? Cek folder spam, atau
            <button type="button" @click="sent = false" class="font-medium text-[#16A34A] hover:underline">
              kirim ulang
            </button>
          </div>
        </div>
      </template>

      <p class="mt-7 text-center text-sm text-[#64748B]">
        Ingat password?
        <router-link to="/login" class="font-medium text-[#16A34A] hover:underline">
          Masuk
        </router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>