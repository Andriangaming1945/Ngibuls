<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import {
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  Calculator,
  Lightbulb,
  User,
  LogOut,
} from 'lucide-vue-next'

// activeKey dipakai untuk halaman yang bukan bagian dari hash routing di '/'
// (misalnya halaman Profil punya route sendiri). Kalau tidak dikasih,
// active menu otomatis ditentukan dari route.hash.
const props = defineProps({
  activeKey: {
    type: String,
    default: null,
  },
})

const route = useRoute()
const router = useRouter()
const { profile, initAuth, logout } = useAuth()

// Halaman-halaman yang pakai sidebar ini nggak selalu lewat Navbar global,
// jadi initAuth dipanggil lagi di sini buat jaga-jaga kalau halamannya
// dibuka langsung (deep link).
onMounted(() => {
  initAuth?.()
})

const siteNavItems = [
  { key: 'dashboard', label: 'Dashboard', hash: '#dashboard', icon: LayoutDashboard },
  { key: 'analisis', label: 'Analisis', hash: '#analisis', icon: BarChart3 },
  { key: 'simulasi', label: 'Simulasi', hash: '#simulasi', icon: Calculator },
  { key: 'rekomendasi', label: 'Rekomendasi', hash: '#rekomendasi', icon: Lightbulb },
]

function isActive(key, hash) {
  if (props.activeKey) return props.activeKey === key
  return route.hash === hash
}

const isProfilActive = computed(() => isActive('profil', null) || route.path === '/profile')

const isSidebarOpen = ref(false)

function closeSidebar() {
  isSidebarOpen.value = false
}
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

watch(isSidebarOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
onUnmounted(() => {
  document.body.style.overflow = ''
})

const initial = () => (profile.value?.name || profile.value?.email || '?').trim().charAt(0).toUpperCase()

async function handleLogout() {
  closeSidebar()
  await logout?.()
  router.push('/')
}
</script>

<template>
  <!-- Mobile top bar -->
  <div class="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0B1220] px-4 py-3.5 lg:hidden">
    <router-link to="/" class="flex items-center gap-2.5 text-lg font-bold tracking-tight">
      <span class="text-white">Ngi</span><span class="text-[#4ADE80]">buls</span>
    </router-link>
    <button
      type="button"
      aria-label="Buka menu"
      :aria-expanded="isSidebarOpen"
      @click="toggleSidebar"
      class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white/80 transition-colors duration-200 hover:border-white/30 hover:bg-white/5"
    >
      <Menu v-if="!isSidebarOpen" class="h-5 w-5" />
      <X v-else class="h-5 w-5" />
    </button>
  </div>

  <!-- Mobile backdrop -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isSidebarOpen"
      @click="closeSidebar"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 -translate-x-full flex-col border-r border-white/10 bg-[#0B1220] px-4 py-6 transition-transform duration-300 ease-out lg:static lg:translate-x-0"
    :class="isSidebarOpen && 'translate-x-0'"
  >
    <div class="flex items-center justify-between px-2">
      <router-link to="/" class="flex items-center gap-2.5 text-xl font-bold tracking-tight">
        <span class="text-white">Ngi</span><span class="text-[#4ADE80]">buls</span>
      </router-link>
      <button
        type="button"
        aria-label="Tutup menu"
        @click="closeSidebar"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors duration-200 hover:bg-white/5 hover:text-white lg:hidden"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <nav class="mt-8 flex-1 space-y-1">
      <p class="px-3 text-xs font-semibold uppercase tracking-wider text-white/40">Menu</p>
      <router-link
        v-for="item in siteNavItems"
        :key="item.key"
        :to="{ path: '/', hash: item.hash }"
        @click="closeSidebar"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/55 transition-all duration-200"
        :class="isActive(item.key, item.hash)
          ? 'bg-[#16A34A] text-white shadow-[0_2px_10px_-2px_rgba(22,163,74,0.6)]'
          : 'hover:text-[#4ADE80]'"
      >
        <component :is="item.icon" class="h-4.5 w-4.5 shrink-0" />
        {{ item.label }}
      </router-link>

      <p class="px-3 pt-5 text-xs font-semibold uppercase tracking-wider text-white/40">Akun</p>
      <router-link
        to="/profile"
        @click="closeSidebar"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
        :class="isProfilActive
          ? 'bg-[#16A34A] text-white shadow-[0_2px_10px_-2px_rgba(22,163,74,0.6)]'
          : 'text-white/55 hover:text-[#4ADE80]'"
      >
        <User class="h-4.5 w-4.5 shrink-0" />
        Profil
      </router-link>
    </nav>

    <div class="mt-6 border-t border-white/10 pt-4">
      <div
        v-if="profile"
        class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
      >
        <span class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#16A34A]/20 text-sm font-semibold text-[#4ADE80]">
          <img v-if="profile.avatar_url" :src="profile.avatar_url" alt="Foto profil" class="h-full w-full object-cover" />
          <span v-else>{{ initial() }}</span>
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-white">{{ profile.name }}</p>
          <p class="truncate text-xs text-white/50">{{ profile.email }}</p>
        </div>
      </div>
      <button
        type="button"
        @click="handleLogout"
        class="mt-2 flex w-full items-center gap-3 rounded-lg border border-white/15 px-3 py-2.5 text-sm font-medium text-white/80 transition-colors duration-200 hover:border-white/30 hover:bg-white/5"
      >
        <LogOut class="h-4.5 w-4.5 shrink-0" />
        Keluar
      </button>
    </div>
  </aside>
</template>