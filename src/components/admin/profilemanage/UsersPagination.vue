<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  totalCount: { type: Number, required: true },
})

defineEmits(['go-to-page'])
</script>

<template>
  <div v-if="totalCount > 0" class="mt-6 flex items-center justify-between text-sm text-[#64748B]">
    <p>
      Menampilkan {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalCount) }}
      dari {{ totalCount }} pengguna
    </p>
    <div class="flex items-center gap-2">
      <button
        type="button"
        @click="$emit('go-to-page', currentPage - 1)"
        :disabled="currentPage === 1"
        class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[#64748B] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>
      <span class="text-[#0F172A]">{{ currentPage }} / {{ totalPages }}</span>
      <button
        type="button"
        @click="$emit('go-to-page', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[#64748B] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>