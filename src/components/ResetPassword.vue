<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Zap, Eye, EyeOff, CheckCircle2 } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const success = ref(false)
const checkingSession = ref(true)
const sessionValid = ref(false)

// Link dari email reset password otomatis bikin Supabase set session
// recovery — dicek sebentar sebelum form ditampilkan, biar gak muncul
// kalau user buka halaman ini langsung tanpa lewat link email.
onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  sessionValid.value = !!data.session
  checkingSession.value = false
})

function validate() {
  if (!password.value) return 'Password wajib diisi'
  if (password.value.length < 8) return 'Password minimal 8 karakter'
  if (password.value !== confirmPassword.value) return 'Konfirmasi password tidak sama'
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
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    success.value = true
    setTimeout(() => router.push('/login'), 1800)
  } catch (e) {
    errorMsg.value = e.message || 'Gagal mengatur ulang password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 sm:px-6">
    <div class="w-full max-w-sm animate-[fadeInUp_0.5s_ease-out_forwards]">
      <router-link to="/" class="mb-8 flex items-center justify-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16A34A]/10">
          <Zap class="h-5 w-5 text-[#16A34A]" />
        </span>
        <span class="text-xl font-bold text-[#0F172A]">
          Ngi<span class="text-[#16A34A]">buls</span>
        </span>
      </router-link>

      <!-- Masih ngecek session -->
      <div v-if="checkingSession" class="text-center text-sm text-[#64748B]">Memuat...</div>

      <!-- Link invalid/expired -->
      <div v-else-if="!sessionValid" class="text-center">
        <h1 class="text-2xl font-bold tracking-tight text-[#0F172A]">Link tidak valid</h1>
        <p class="mt-2 text-sm leading-relaxed text-[#64748B]">
          Link reset password sudah kadaluarsa atau tidak valid. Silakan minta link baru.
        </p>
        <router-link
          to="/forgot-password"
          class="mt-6 inline-block rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#15803D]"
        >
          Minta Link Baru
        </router-link>
      </div>

      <!-- Berhasil -->
      <div v-else-if="success" class="flex flex-col items-center text-center">
        <span class="flex h-14 w-14 items-center justify-center rounded-full bg-[#16A34A]/10">
          <CheckCircle2 class="h-7 w-7 text-[#16A34A]" />
        </span>
        <h1 class="mt-5 text-2xl font-bold tracking-tight text-[#0F172A]">Password berhasil diubah</h1>
        <p class="mt-2 text-sm leading-relaxed text-[#64748B]">Mengarahkan ke halaman login...</p>
      </div>

      <!-- Form -->
      <template v-else>
        <h1 class="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">Atur ulang password</h1>
        <p class="mt-2 text-sm leading-relaxed text-[#64748B]">Masukkan password baru untuk akunmu.</p>

        <p v-if="errorMsg" class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ errorMsg }}
        </p>

        <form class="mt-7 flex flex-col gap-4" @submit.prevent="handleSubmit">
          <div>
            <label for="password" class="text-sm font-medium text-[#0F172A]">Password Baru</label>
            <div class="relative mt-1.5">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm text-[#0F172A] placeholder:text-slate-400 transition-shadow focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-[#0F172A]"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label for="confirm-password" class="text-sm font-medium text-[#0F172A]">Konfirmasi Password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 transition-shadow focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="mt-2 w-full rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(22,163,74,0.5)] transition-colors hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loading ? 'Menyimpan...' : 'Simpan Password Baru' }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>