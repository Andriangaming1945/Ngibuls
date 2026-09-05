<script setup>
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Hapus Data?' },
  message: { type: String, default: 'Tindakan ini tidak bisa dibatalkan.' },
  loading: { type: Boolean, default: false },
})

defineEmits(['confirm', 'close'])
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-red-50">
            <svg class="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14.14A1 1 0 003 19.5h18a1 1 0 00.89-1.5L13.71 3.86a1 1 0 00-1.72 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-[#0F172A]">{{ title }}</h3>
            <p class="mt-1 text-sm text-[#64748B]">{{ message }}</p>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            :disabled="loading"
            @click="$emit('close')"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="loading"
            @click="$emit('confirm')"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loading ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>