<script setup>
defineProps({
  show: { type: Boolean, default: false },
  item: { type: Object, default: null },
})
defineEmits(['close'])

function formatRupiah(n) {
  return `Rp${Math.round(Number(n || 0)).toLocaleString('id-ID')}`
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show && item" class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 class="text-base font-semibold text-[#0F172A]">Detail Rekomendasi</h3>
          <button type="button" @click="$emit('close')" class="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-50">✕</button>
        </div>
        <div class="space-y-4 px-6 py-5">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Perangkat/Aktivitas</p>
            <p class="mt-1 text-sm font-medium text-[#0F172A]">{{ item.contributor_name }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Pengguna</p>
            <p class="mt-1 text-sm text-[#0F172A]">{{ item.profiles?.name || item.profiles?.email || '-' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Perubahan Nilai</p>
            <p class="mt-1 text-sm text-[#0F172A]">{{ item.current_value }} → {{ item.suggested_value }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Potensi Hemat</p>
            <p class="mt-1 text-sm font-semibold text-[#16A34A]">{{ formatRupiah(item.potential_saving_cost) }}</p>
          </div>
        </div>
        <div class="flex justify-end border-t border-slate-100 px-6 py-4">
          <button type="button" @click="$emit('close')" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50">Tutup</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>