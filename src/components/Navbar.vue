<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, X, ChevronDown, LogOut, User, ShieldCheck } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const menuItems = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Analisis', href: '#analisis' },
  { label: 'Simulasi', href: '#simulasi' },
  { label: 'Rekomendasi', href: '#rekomendasi' },
]

const route = useRoute()
const router = useRouter()
const { user, profile, authLoading, initAuth, logout } = useAuth()

const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 12
  if (isScrolled.value) {
    isUserMenuOpen.value = false
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  initAuth()
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const isLoggedIn = computed(() => !authLoading.value && !!user.value && !!profile.value)
const isAdmin = computed(() => profile.value?.role === 'admin')
const displayName = computed(() => profile.value?.name || profile.value?.email || '')
const initial = computed(() => displayName.value.trim().charAt(0).toUpperCase() || '?')
const avatarUrl = computed(() => profile.value?.avatar_url || '')
const activeHref = computed(() => route.hash || menuItems[0].href)

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

async function handleLogout() {
  isUserMenuOpen.value = false
  isMobileMenuOpen.value = false
  await logout()
  router.push('/login')
}
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 w-full transition-colors duration-300"
    :class="[
      isScrolled
        ? 'bg-[#0B1220]/90 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl'
        : 'bg-transparent',
    ]"
  >
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div
        class="flex items-center justify-between transition-all duration-300"
        :class="isScrolled ? 'h-16' : 'h-20'"
      >
        <router-link to="/" class="flex items-center gap-2.5 text-xl font-bold tracking-tight">
          <span>
            <span class="text-white">Ngi</span><span class="text-[#4ADE80]">buls</span>
          </span>
        </router-link>

        <nav class="hidden md:block">
          <ul class="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
            <li v-for="item in menuItems" :key="item.label">
              <router-link
                :to="{ path: '/', hash: item.href }"
                @click="closeMobileMenu"
                class="block rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                :class="activeHref === item.href
                  ? 'bg-[#16A34A] text-white shadow-[0_2px_10px_-2px_rgba(22,163,74,0.6)]'
                  : 'text-white/55 hover:text-white'"
              >
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </nav>

        <div class="hidden items-center gap-3 md:flex">
          <template v-if="!isLoggedIn">
            <router-link
              to="/login"
              class="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white"
            >
              Masuk
            </router-link>
            <router-link
              to="/register"
              class="rounded-lg bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(22,163,74,0.5)] transition-all duration-200 hover:bg-[#15803D] hover:shadow-[0_6px_18px_-4px_rgba(22,163,74,0.6)]"
            >
              Daftar
            </router-link>
          </template>

          <div v-else class="relative">
            <button
              type="button"
              @click="toggleUserMenu"
              class="flex items-center gap-2 rounded-full border border-white/15 py-1.5 pl-1.5 pr-3 text-sm text-white/85 transition-colors duration-200 hover:border-white/30 hover:bg-white/5"
            >
              <span class="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#16A34A]/20 text-xs font-semibold text-[#4ADE80]">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Foto profil" class="h-full w-full object-cover" />
                <span v-else>{{ initial }}</span>
              </span>
              <span class="max-w-[130px] truncate font-medium">{{ displayName }}</span>
              <ChevronDown class="h-4 w-4 text-white/50 transition-transform duration-200" :class="isUserMenuOpen && 'rotate-180'" />
            </button>

            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#111C36] shadow-2xl"
              >
                <div class="border-b border-white/10 px-4 py-3">
                  <p class="truncate text-sm font-medium text-white">{{ profile?.name }}</p>
                  <p class="truncate text-xs text-white/50">{{ profile?.email }}</p>
                </div>
                <router-link
                  v-if="isAdmin"
                  to="/admin/dashboard"
                  @click="isUserMenuOpen = false"
                  class="flex w-full items-center gap-2 px-4 py-3 text-sm text-white/70 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                >
                  <ShieldCheck class="h-4 w-4 text-[#4ADE80]" />
                  Admin Dashboard
                </router-link>
                <router-link
                  to="/profile"
                  @click="isUserMenuOpen = false"
                  class="flex w-full items-center gap-2 px-4 py-3 text-sm text-white/70 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                >
                  <User class="h-4 w-4" />
                  Lihat Profil
                </router-link>
                <button
                  type="button"
                  @click="handleLogout"
                  class="flex w-full items-center gap-2 border-t border-white/10 px-4 py-3 text-sm text-white/70 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                >
                  <LogOut class="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <button
          type="button"
          aria-label="Buka menu navigasi"
          :aria-expanded="isMobileMenuOpen"
          @click="toggleMobileMenu"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors duration-200 hover:border-white/30 hover:bg-white/5 md:hidden"
        >
          <Menu v-if="!isMobileMenuOpen" class="h-5 w-5" />
          <X v-else class="h-5 w-5" />
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMobileMenuOpen" class="border-t border-white/10 bg-[#0B1220] md:hidden">
        <ul class="flex flex-col gap-0.5 px-4 py-3">
          <li v-for="item in menuItems" :key="item.label">
            <router-link
              :to="{ path: '/', hash: item.href }"
              @click="closeMobileMenu"
              class="block rounded-lg px-3.5 py-3 text-sm font-medium transition-colors duration-200"
              :class="activeHref === item.href ? 'bg-[#16A34A]/10 text-[#4ADE80]' : 'text-white/70 hover:bg-white/5'"
            >
              {{ item.label }}
            </router-link>
          </li>
        </ul>

        <div class="border-t border-white/10 px-4 py-4">
          <template v-if="!isLoggedIn">
            <router-link
              to="/login"
              @click="closeMobileMenu"
              class="block rounded-lg px-3 py-3 text-center text-sm font-medium text-white/70 transition-colors duration-200 hover:bg-white/5"
            >
              Masuk
            </router-link>
            <router-link
              to="/register"
              @click="closeMobileMenu"
              class="mt-2 block rounded-lg bg-[#16A34A] px-3 py-3 text-center text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(22,163,74,0.5)]"
            >
              Daftar
            </router-link>
          </template>

          <template v-else>
            <div class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#16A34A]/20 text-sm font-semibold text-[#4ADE80]">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Foto profil" class="h-full w-full object-cover" />
                <span v-else>{{ initial }}</span>
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-white">{{ displayName }}</p>
                <p class="truncate text-xs text-white/50">{{ profile?.email }}</p>
              </div>
            </div>
            <router-link
              v-if="isAdmin"
              to="/admin/dashboard"
              @click="closeMobileMenu"
              class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[#4ADE80]/30 bg-[#16A34A]/10 px-3 py-3 text-sm font-medium text-[#4ADE80] transition-colors duration-200 hover:bg-[#16A34A]/20"
            >
              <ShieldCheck class="h-4 w-4" />
              Admin Dashboard
            </router-link>
            <router-link
              to="/profile"
              @click="closeMobileMenu"
              class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-3 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/5"
            >
              <User class="h-4 w-4" />
              Lihat Profil
            </router-link>
            <button
              type="button"
              @click="handleLogout"
              class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-3 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/5"
            >
              <LogOut class="h-4 w-4" />
              Keluar
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </header>
</template>