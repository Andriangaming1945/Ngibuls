<script setup>
import { AlertTriangle, Loader2, Trash2 } from 'lucide-vue-next'

defineProps({
  show: { type: Boolean, required: true },
  user: { type: Object, default: null },
  error: { type: String, default: '' },
  deleting: { type: Boolean, default: false },
})

defineEmits(['close', 'confirm'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 px-4" @click.self="$emit('close')">
    <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle class="h-5 w-5" />
        </span>
        <div>
          <h2 class="text-base font-semibold text-[#0F172A]">Hapus Pengguna</h2>
          <p class="text-sm text-[#64748B]">Tindakan ini tidak bisa dibatalkan.</p>
        </div>
      </div>

      <p class="mt-4 text-sm text-[#0F172A]">
        Yakin ingin menghapus <span class="font-medium">{{ user?.name || user?.email }}</span>?
      </p>

      <p v-if="error" class="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ error }}</p>

      <div class="mt-5 flex items-center justify-end gap-3">
        <button
          type="button"
          @click="$emit('close')"
          class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-slate-50"
        >
          Batal
        </button>
        <button
          type="button"
          @click="$emit('confirm')"
          :disabled="deleting"
          class="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Loader2 v-if="deleting" class="h-4 w-4 animate-spin" />
          <Trash2 v-else class="h-4 w-4" />
          Hapus
        </button>
      </div>
    </div>
  </div>
</template>