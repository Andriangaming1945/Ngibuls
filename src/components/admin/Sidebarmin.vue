<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  FileBarChart,
  Settings,
  User,
  LogOut,
  ShieldCheck,
  Database,
  Lightbulb,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { profile, initAuth, logout } = useAuth()

onMounted(() => {
  initAuth?.()
})

const adminNavItems = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Manajemen User', path: '/admin/Managementuser', icon: Users },
  { key: 'data', label: 'Manajemen Data', path: '/admin/Managementdata', icon: Database },
  { key: 'laporan', label: 'Laporan', path: '/admin/laporan', icon: FileBarChart },
  { key: 'pengaturan', label: 'Pengaturan', path: '/admin/pengaturan', icon: Settings },
]

function isActive(path) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

const isProfilActive = computed(() => route.path === '/admin/profile')

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

const avatarSrc = computed(() =>
  profile.value?.avatar_url || profile.value?.avatar || profile.value?.photo_url || profile.value?.picture || null
)
const avatarBroken = ref(false)
watch(avatarSrc, () => {
  avatarBroken.value = false
})

async function handleLogout() {
  closeSidebar()
  try {
    await logout?.()
  } finally {
    router.replace('/')
  }
}
</script>

<template>
  <div class="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6 md:hidden">
    <router-link to="/admin" class="flex items-center gap-2 text-lg font-bold tracking-tight">
      <span class="text-white">Ngi</span><span class="text-emerald-400">buls</span>
      <span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Admin</span>
    </router-link>
    <button
      type="button"
      aria-label="Buka menu"
      :aria-expanded="isSidebarOpen"
      @click="toggleSidebar"
      class="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
    >
      <Menu v-if="!isSidebarOpen" class="h-5 w-5" />
      <X v-else class="h-5 w-5" />
    </button>
  </div>

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
      class="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
    />
  </Transition>

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs -translate-x-full flex-col bg-slate-950 transition-transform duration-300 ease-out sm:max-w-sm md:sticky md:top-0 md:h-screen md:w-64 md:max-w-none md:translate-x-0 lg:w-72"
    :class="isSidebarOpen && 'translate-x-0'"
  >
    <div class="flex items-center justify-between border-b border-slate-800 px-5 py-5 md:px-6">
      <router-link to="/admin" class="flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-80">
        <span class="text-white">Ngi</span><span class="text-emerald-400">buls</span>
        <span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Admin</span>
      </router-link>
      <button
        type="button"
        aria-label="Tutup menu"
        @click="closeSidebar"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-5 sm:px-4">
      <p class="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Menu</p>
      <router-link
        v-for="item in adminNavItems"
        :key="item.key"
        :to="item.path"
        @click="closeSidebar"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="isActive(item.path)
          ? 'bg-emerald-600 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span class="truncate">{{ item.label }}</span>
      </router-link>

      <p class="px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Akun</p>
      <router-link
        to="/admin/profile"
        @click="closeSidebar"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="isProfilActive
          ? 'bg-emerald-600 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
      >
        <User class="h-5 w-5 shrink-0" />
        Profil
      </router-link>
    </nav>

    <div class="border-t border-slate-800 px-3 py-4 sm:px-4">
      <div
        v-if="profile"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5"
      >
        <span class="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
          <img
            v-if="avatarSrc && !avatarBroken"
            :src="avatarSrc"
            alt="Foto profil"
            class="h-full w-full object-cover"
            referrerpolicy="no-referrer"
            @error="avatarBroken = true"
          />
          <span v-else>{{ initial() }}</span>
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-white">{{ profile.name }}</p>
          <p class="flex items-center gap-1 truncate text-xs text-slate-500">
            <ShieldCheck class="h-3 w-3 shrink-0 text-emerald-400" />
            Admin
          </p>
        </div>
      </div>
      <button
        type="button"
        @click="handleLogout"
        class="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
      >
        <LogOut class="h-5 w-5 shrink-0" />
        Keluar
      </button>
    </div>
  </aside>
</template>