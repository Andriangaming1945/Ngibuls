<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useDeviceCatalog } from '@/composables/useDeviceCatalog.js'
import { Users, Zap, ZapOff, BookmarkCheck, Loader2, LayoutDashboard } from 'lucide-vue-next'
import { priorityListFor } from '@/utils/pdfExportHelpers.js'
import DashboardStatCard from './Dashboardstatcard.vue'
import CategoryBreakdown from './Categorybreakdown.vue'
import RecentActivityList from './Recentactivitylist.vue'

const { catalog: deviceCatalog, fetchCatalog: fetchDeviceCatalog } = useDeviceCatalog()

const loadingStats = ref(true)
const totalUsers = ref(0)
const totalRecommendations = ref(0)
const recentActivity = ref([])

const activeDevices = computed(() => deviceCatalog.value.filter((d) => d.status === 'active').length)
const inactiveDevices = computed(() => deviceCatalog.value.filter((d) => d.status === 'inactive').length)

// Konfigurasi 4 kartu statistik dalam satu array, supaya tiap kartu dapat
// `index` buat delay animasi berantai tanpa nulis blok yang sama 4x.
const statCards = computed(() => [
  { key: 'users', icon: Users, iconBg: 'bg-[#3B82F6]/10', iconColor: 'text-[#3B82F6]', label: 'Total Pengguna', value: totalUsers.value, loading: loadingStats.value },
  { key: 'active', icon: Zap, iconBg: 'bg-[#16A34A]/10', iconColor: 'text-[#16A34A]', label: 'Perangkat Aktif', value: activeDevices.value, loading: false },
  { key: 'inactive', icon: ZapOff, iconBg: 'bg-slate-100', iconColor: 'text-slate-400', label: 'Perangkat Nonaktif', value: inactiveDevices.value, loading: false },
  { key: 'recs', icon: BookmarkCheck, iconBg: 'bg-[#F59E0B]/10', iconColor: 'text-[#F59E0B]', label: 'Rekomendasi Tersimpan', value: totalRecommendations.value, loading: loadingStats.value },
])

// Breakdown jumlah perangkat per kategori, dari catalog yang sama dipakai
// di halaman Manajemen Data — bukan query terpisah. Device yang sudah
// dinonaktifkan/dihapus (deleted_at terisi) dikecualikan, biar konsisten
// dengan kartu "Perangkat Aktif" — deleted_at sengaja tidak difilter di
// useDeviceCatalog karena halaman Manajemen Data butuh lihat semuanya.
const categoryBreakdown = computed(() => {
  const map = new Map()
  for (const d of deviceCatalog.value) {
    if (d.deleted_at) continue
    map.set(d.category, (map.get(d.category) || 0) + 1)
  }
  const max = Math.max(1, ...map.values())
  return Array.from(map.entries())
    .map(([category, count]) => ({ category, count, percent: Math.round((count / max) * 100) }))
    .sort((a, b) => b.count - a.count)
})

// Lengkapi tiap baris aktivitas dengan breakdown prioritas, dihitung dari
// data rekomendasi yang sama persis dipakai di export PDF/Excel, supaya
// teksnya konsisten di seluruh aplikasi.
const recentActivityWithPriority = computed(() =>
  recentActivity.value.map((rec) => ({
    ...rec,
    priority: priorityListFor(rec, rec.contributor_name),
  }))
)

async function loadStats() {
  loadingStats.value = true
  try {
    const [{ count: userCount }, { count: recCount }, { data: recentRecs }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('saved_recommendations').select('*', { count: 'exact', head: true }),
      supabase
        .from('saved_recommendations')
        .select(
          'id, contributor_name, contributor_type, current_value, suggested_value, potential_saving_cost, budget_preference, created_at, profiles(name, email)'
        )
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    totalUsers.value = userCount || 0
    totalRecommendations.value = recCount || 0
    recentActivity.value = recentRecs || []
  } finally {
    loadingStats.value = false
  }
}

onMounted(() => {
  loadStats()
  fetchDeviceCatalog()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#16A34A]/10">
        <LayoutDashboard class="h-5 w-5 text-[#16A34A]" />
      </span>
      <div>
        <h2 class="text-xl font-bold text-[#0F172A]">Dashboard</h2>
        <p class="text-sm text-[#64748B]">Ringkasan aktivitas dan data Ngibuls secara keseluruhan.</p>
      </div>
    </div>

    <!-- Kartu statistik -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        v-for="(card, i) in statCards"
        :key="card.key"
        :icon="card.icon"
        :icon-bg="card.iconBg"
        :icon-color="card.iconColor"
        :label="card.label"
        :value="card.value"
        :loading="card.loading"
        :index="i"
      >
        <template #loading><Loader2 class="h-4 w-4 animate-spin text-slate-300" /></template>
      </DashboardStatCard>
    </div>

    <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <CategoryBreakdown :categories="categoryBreakdown" />
      <RecentActivityList :activities="recentActivityWithPriority" :loading="loadingStats" />
    </div>
  </div>
</template>