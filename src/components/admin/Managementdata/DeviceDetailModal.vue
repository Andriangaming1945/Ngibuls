<script setup>
import { X, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  deviceName: String,
  rows: { type: Array, default: () => [] },
  loading: Boolean,
})
defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-[#0F172A]">Detail "{{ deviceName }}"</h3>
        <button @click="$emit('close')" class="text-[#64748B] hover:text-[#0F172A]"><X class="h-5 w-5" /></button>
      </div>

      <div class="mt-4 max-h-80 overflow-y-auto">
        <Loader2 v-if="loading" class="mx-auto h-5 w-5 animate-spin text-[#16A34A]" />
        <p v-else-if="rows.length === 0" class="py-6 text-center text-sm text-[#64748B]">Tidak ada data.</p>
        <table v-else class="w-full text-left text-sm">
          <thead class="text-xs text-[#64748B]">
            <tr>
              <th class="py-2">User</th>
              <th class="py-2">Watt</th>
              <th class="py-2">Jam/hari</th>
              <th class="py-2">Qty</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="r in rows" :key="r.id">
              <td class="py-2">{{ r.profiles?.name || '-' }}</td>
              <td class="py-2">{{ r.watt }} W</td>
              <td class="py-2">{{ r.hours_per_day }} jam</td>
              <td class="py-2">{{ r.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>