<script setup>
import { computed } from 'vue'
import { X, Loader2, Users, Zap, TrendingDown } from 'lucide-vue-next'
import CategoryBadge from './CategoryBadge.vue'
import StatusBadge from './StatusBadge.vue'
import DeviceAvatar from './DeviceAvatar.vue'

const props = defineProps({
  show: Boolean,
  device: { type: Object, default: () => ({}) },
  usageRows: { type: Array, default: () => [] },
  recommendationRows: { type: Array, default: () => [] },
  loading: Boolean,
})
defineEmits(['close'])

function formatRupiah(n) {
  return `Rp${Number(n || 0).toLocaleString('id-ID')}`
}
function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
function initials(name) {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
}

const totalSaving = computed(() =>
  props.recommendationRows.reduce((sum, r) => sum + Number(r.potential_saving_cost || 0), 0)
)
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 p-6">
        <div class="flex items-center gap-3">
          <DeviceAvatar :category="device.category" />
          <div>
            <h3 class="text-lg font-semibold text-[#0F172A]">{{ device.name }}</h3>
            <div class="mt-1 flex items-center gap-2">
              <CategoryBadge :category="device.category" />
              <StatusBadge :status="device.status" />
            </div>
          </div>
        </div>
        <button @click="$emit('close')" class="text-[#64748B] hover:text-[#0F172A]"><X class="h-5 w-5" /></button>
      </div>

      <Loader2 v-if="loading" class="mx-auto my-12 h-6 w-6 animate-spin text-[#16A34A]" />

      <div v-else class="max-h-[32rem] overflow-y-auto p-6">
        <!-- Stat grid -->
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
            <p class="text-xs text-[#64748B]">Daya Default</p>
            <p class="mt-1 text-lg font-semibold text-[#0F172A]">{{ device.watt }} W</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
            <p class="text-xs text-[#64748B]">Pengguna</p>
            <p class="mt-1 text-lg font-semibold text-[#0F172A]">{{ usageRows.length }}</p>
          </div>
          <div class="rounded-xl border border-[#16A34A]/20 bg-[#16A34A]/5 p-3.5 text-center">
            <p class="text-xs text-[#64748B]">Total Potensi Hemat</p>
            <p class="mt-1 text-lg font-semibold text-[#16A34A]">{{ formatRupiah(totalSaving) }}</p>
          </div>
        </div>

        <!-- Pengguna Perangkat -->
        <div class="mt-6">
          <div class="flex items-center gap-2">
            <Users class="h-4 w-4 text-[#64748B]" />
            <h4 class="text-sm font-semibold text-[#0F172A]">Pengguna Perangkat</h4>
          </div>

          <p v-if="usageRows.length === 0" class="mt-3 rounded-xl bg-slate-50 py-6 text-center text-sm text-[#64748B]">
            Belum ada user yang input perangkat ini.
          </p>

          <div v-else class="mt-3 space-y-2">
            <div
              v-for="r in usageRows"
              :key="r.id"
              class="flex items-center justify-between rounded-xl border border-slate-200 p-3"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#F59E0B]/10 text-xs font-semibold text-[#F59E0B]">
                  {{ initials(r.profiles?.name) }}
                </div>
                <span class="text-sm font-medium text-[#0F172A]">{{ r.profiles?.name || '-' }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-[#64748B]">
                <span class="rounded-full bg-slate-100 px-2.5 py-1">{{ r.watt }} W</span>
                <span class="rounded-full bg-slate-100 px-2.5 py-1">{{ r.hours_per_day }} jam/hari</span>
                <span class="rounded-full bg-slate-100 px-2.5 py-1">Qty {{ r.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Riwayat Rekomendasi -->
        <div class="mt-6">
          <div class="flex items-center gap-2">
            <TrendingDown class="h-4 w-4 text-[#64748B]" />
            <h4 class="text-sm font-semibold text-[#0F172A]">Riwayat Rekomendasi</h4>
          </div>

          <p
            v-if="recommendationRows.length === 0"
            class="mt-3 rounded-xl bg-slate-50 py-6 text-center text-sm text-[#64748B]"
          >
            Belum ada rekomendasi yang menyangkut perangkat ini.
          </p>

          <div v-else class="mt-3 space-y-3">
            <div v-for="r in recommendationRows" :key="r.id" class="rounded-xl border border-slate-200 p-4">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
                    <Zap class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-[#0F172A]">{{ r.profiles?.name || r.profiles?.email || '-' }}</p>
                    <p class="text-xs text-[#64748B]">{{ formatDate(r.created_at) }}</p>
                  </div>
                </div>
                <span class="text-sm font-semibold text-[#16A34A]">{{ formatRupiah(r.potential_saving_cost) }}/bulan</span>
              </div>

              <div class="mt-3 rounded-lg bg-[#16A34A]/5 p-3 text-sm text-[#166534]">
                Rekomendasi: ubah dari <span class="font-medium">{{ r.current_value }}</span> ke
                <span class="font-medium">{{ r.suggested_value }}</span>
                <span v-if="r.potential_saving_amount" class="text-[#64748B]">
                  · hemat ≈ {{ Number(r.potential_saving_amount).toLocaleString('id-ID') }}/bulan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>