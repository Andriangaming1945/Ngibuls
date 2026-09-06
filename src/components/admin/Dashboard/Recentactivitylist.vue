<script setup>
import { Clock, Loader2, Zap, TrendingDown } from 'lucide-vue-next'
import { formatRupiah, formatTanggal, budgetPreferenceLabel } from '@/utils/pdfExportHelpers.js'
import ActivityPriorityList from './Activityprioritylist.vue'

defineProps({
  // Setiap item sudah dilengkapi `priority` (hasil priorityListFor) oleh Dashboard.vue
  activities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
    <div class="flex items-center gap-2">
      <Clock class="h-4 w-4 text-[#64748B]" />
      <h3 class="text-sm font-semibold text-[#0F172A]">Aktivitas Terbaru</h3>
    </div>

    <div v-if="loading" class="mt-4 flex items-center gap-2 text-sm text-slate-400">
      <Loader2 class="h-4 w-4 animate-spin" />
      Memuat...
    </div>

    <div v-else-if="!activities.length" class="mt-4 text-sm text-slate-400">
      Belum ada rekomendasi yang disimpan user.
    </div>

    <div v-else class="mt-4 space-y-3">
      <div
        v-for="(rec, i) in activities"
        :key="rec.id"
        class="activity-card group rounded-xl border border-slate-200 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        :style="{ animationDelay: `${i * 110}ms` }"
      >
        <!-- Header: siapa & kapan -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Zap class="h-4 w-4 text-[#F59E0B]" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-[#0F172A]">
                {{ rec.profiles?.name || rec.profiles?.email || 'Pengguna' }}
              </p>
              <p class="truncate text-xs text-slate-500">
                Menyimpan rekomendasi untuk "{{ rec.contributor_name }}"
              </p>
            </div>
          </div>
          <span class="shrink-0 text-xs text-slate-400">{{ formatTanggal(rec.created_at) }}</span>
        </div>

        <!-- Isi rekomendasi: dari -> ke, potensi hemat, preferensi -->
        <div class="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 text-xs">
          <TrendingDown class="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span class="font-medium text-emerald-800">{{ rec.current_value }} → {{ rec.suggested_value }}</span>
          <span class="text-emerald-700">· hemat ≈ {{ formatRupiah(rec.potential_saving_cost) }}/bulan</span>
          <span class="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-700 shadow-sm">
            {{ budgetPreferenceLabel[rec.budget_preference] || 'Tanpa Biaya' }}
          </span>
        </div>

        <!-- Skala prioritas -->
        <div class="mt-3">
          <ActivityPriorityList :priority="rec.priority" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-card {
  animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>