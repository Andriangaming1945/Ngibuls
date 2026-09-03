<script setup>
import { Search } from 'lucide-vue-next'

defineProps({
  search: String,
  category: String,
  status: String,
  categoryOptions: { type: Array, default: () => [] },
})
defineEmits(['update:search', 'update:category', 'update:status'])
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <div class="relative flex-1">
      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
      <input
        :value="search"
        @input="$emit('update:search', $event.target.value)"
        type="text"
        placeholder="Cari perangkat listrik..."
        class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#16A34A] focus:outline-none"
      />
    </div>
    <select
      :value="category"
      @change="$emit('update:category', $event.target.value)"
      class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none"
    >
      <option value="all">Semua Kategori</option>
      <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
    </select>
    <select
      :value="status"
      @change="$emit('update:status', $event.target.value)"
      class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none"
    >
      <option value="all">Semua Status</option>
      <option value="active">Aktif</option>
      <option value="inactive">Nonaktif</option>
    </select>
  </div>
</template>