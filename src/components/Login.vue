<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Zap, Eye, EyeOff, ShieldCheck, TrendingDown, Gauge, ArrowLeft } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login, loginWithGoogle } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

const loading = ref(false)
const errorMsg = ref('')

function validate() {
  if (!email.value.trim()) return 'Email wajib diisi'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) return 'Format email tidak valid'
  if (!password.value) return 'Password wajib diisi'
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
    await login({ email: email.value.trim(), password: password.value })
    router.push('/')
  } catch (e) {
    errorMsg.value =
      e.message === '__NOT_REGISTERED__'
        ? 'Akun belum terdaftar. Silakan daftar terlebih dahulu.'
        : e.message
    if (e.message === '__NOT_REGISTERED__') {
      setTimeout(() => router.push('/register'), 1200)
    }
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await loginWithGoogle('login')
  } catch (e) {
    errorMsg.value = e.message
    loading.value = false
  }
}
</script>

<template>
  <div class="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <!-- Tombol kembali ke beranda -->
    <router-link
      to="/"
      class="fixed left-4 top-4 z-20 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-2 text-sm font-medium text-[#0F172A] shadow-sm backdrop-blur transition-colors hover:bg-white lg:left-6 lg:top-6 lg:bg-white/10 lg:text-white lg:hover:bg-white/20"
    >
      <ArrowLeft class="h-4 w-4" />
      Kembali ke beranda
    </router-link>

    <!-- LEFT: brand panel (desktop only) -->
    <div class="relative hidden overflow-hidden bg-[#0F172A] lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div class="absolute inset-0 bg-gradient-to-br from-[#0F2747]/95 via-[#0F2747]/90 to-[#163A5F]/85" />

      <svg class="pointer-events-none absolute inset-0 h-full w-full opacity-[0.15]" viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="white" stroke-width="1.2" opacity="0.5">
          <path d="M80,120 H320 V300 H560" />
          <path d="M560,300 V120 H720" />
          <path d="M60,480 H280 V620 H500" />
          <path d="M500,620 H700" />
          <path d="M320,300 V480 H280" />
        </g>
        <g fill="white" opacity="0.6">
          <circle cx="320" cy="120" r="3" />
          <circle cx="560" cy="300" r="3.5" />
          <circle cx="280" cy="480" r="3" />
          <circle cx="500" cy="620" r="3.5" />
        </g>
      </svg>

      <div class="pointer-events-none absolute -left-20 bottom-0 h-[360px] w-[360px] rounded-full bg-[#16A34A]/20 blur-[100px]" />

      <router-link to="/" class="relative z-10 flex items-center gap-2 opacity-0 pointer-events-none">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16A34A]/15">
          <Zap class="h-5 w-5 text-[#16A34A]" />
        </span>
        <span class="text-xl font-bold text-white">
          Ngi<span class="text-[#16A34A]">buls</span>
        </span>
      </router-link>

      <div class="relative z-10 max-w-sm">
        <h2 class="text-3xl font-bold leading-tight text-white">
          Tahu ke mana biaya energi itu pergi?
        </h2>
        <p class="mt-3 text-sm leading-relaxed text-white/60">
          Masuk untuk melihat analisis, simulasi, dan rekomendasi penghematan listrik & air yang sesuai kebiasaanmu.
        </p>

        <div class="mt-8 space-y-4">
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
              <Gauge class="h-4 w-4 text-[#F59E0B]" />
            </span>
            <p class="text-sm text-white/70">Pantau listrik & air secara real-time</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
              <TrendingDown class="h-4 w-4 text-[#16A34A]" />
            </span>
            <p class="text-sm text-white/70">Rekomendasi hemat sesuai kebiasaanmu</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
              <ShieldCheck class="h-4 w-4 text-[#3B82F6]" />
            </span>
            <p class="text-sm text-white/70">Data kamu aman & privat</p>
          </div>
        </div>
      </div>

      <p class="relative z-10 text-xs text-white/30">© {{ new Date().getFullYear() }} Ngibuls</p>
    </div>

    <!-- RIGHT: form -->
    <div class="flex items-center justify-center bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-16">
      <div class="w-full max-w-sm animate-[fadeInUp_0.5s_ease-out_forwards]">
        <router-link to="/" class="mb-8 flex items-center justify-center gap-2 lg:hidden">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16A34A]/10">
            <Zap class="h-5 w-5 text-[#16A34A]" />
          </span>
          <span class="text-xl font-bold text-[#0F172A]">
            Ngi<span class="text-[#16A34A]">buls</span>
          </span>
        </router-link>

        <h1 class="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
          Selamat datang kembali
        </h1>
        <p class="mt-2 text-sm leading-relaxed text-[#64748B]">
          Masuk untuk melihat analisis dan simulasi penghematanmu.
        </p>

        <p v-if="errorMsg" class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ errorMsg }}
        </p>

        <button
          type="button"
          :disabled="loading"
          @click="handleGoogleLogin"
          class="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-[#0F172A] shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg class="h-4 w-4" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6c-2 1.4-4.6 2.2-7.7 2.2-5.2 0-9.6-3.4-11.2-8.1l-6.6 5.1C9.5 39.7 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.6 5.6C41.9 35.9 44 30.4 44 24c0-1.3-.1-2.6-.4-3.5z"/>
          </svg>
          Masuk dengan Google
        </button>

        <div class="my-6 flex items-center gap-3">
          <div class="h-px flex-1 bg-slate-200" />
          <span class="text-xs font-medium uppercase tracking-[0.1em] text-slate-400">atau</span>
          <div class="h-px flex-1 bg-slate-200" />
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
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

          <div>
            <label for="password" class="text-sm font-medium text-[#0F172A]">Password</label>
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
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-[#64748B]">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/30"
              />
              Ingat saya
            </label>
            <a href="/forgot-password" class="text-sm font-medium text-[#16A34A] hover:underline">
              Lupa password?
            </a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="mt-2 w-full rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(22,163,74,0.5)] transition-colors hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loading ? 'Memproses...' : 'Masuk' }}
          </button>
        </form>

        <p class="mt-7 text-center text-sm text-[#64748B]">
          Belum punya akun?
          <router-link to="/register" class="font-medium text-[#16A34A] hover:underline">
            Daftar
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>