<script setup>
defineProps({
  search: { type: String, default: '' },
  scope: { type: String, default: '' },
})

defineEmits(['update:search', 'update:scope'])
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <div class="relative flex-1">
      <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
      </svg>
      <input
        type="text"
        :value="search"
        @input="$emit('update:search', $event.target.value)"
        placeholder="Cari nama perangkat yang pernah diekspor..."
        class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
      />
    </div>

    <select
      :value="scope"
      @change="$emit('update:scope', $event.target.value)"
      class="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 sm:w-48"
    >
      <option value="">Semua Cakupan</option>
      <option value="single">Satu Perangkat</option>
      <option value="selected">Perangkat Terpilih</option>
      <option value="all">Semua Perangkat</option>
    </select>
  </div>
</template>