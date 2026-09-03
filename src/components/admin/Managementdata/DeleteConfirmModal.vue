<script setup>
import { Loader2 } from 'lucide-vue-next'

defineProps({
  show: Boolean,
  deviceName: String,
  deleting: { type: Boolean, default: false },
})
defineEmits(['close', 'confirm'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 px-4" @click.self="$emit('close')">
    <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
      <h2 class="text-base font-semibold text-[#0F172A]">Hapus Perangkat</h2>
      <p class="mt-2 text-sm text-[#64748B]">
        Yakin mau hapus "<span class="font-medium text-[#0F172A]">{{ deviceName }}</span>"? Data ini tidak bisa dikembalikan.
      </p>
      <div class="mt-5 flex items-center justify-end gap-3">
        <button type="button" @click="$emit('close')" class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-[#64748B] hover:bg-slate-50">
          Batal
        </button>
        <button
          type="button"
          :disabled="deleting"
          @click="$emit('confirm')"
          class="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Loader2 v-if="deleting" class="h-4 w-4 animate-spin" />
          Hapus
        </button>
      </div>
    </div>
  </div>
</template>