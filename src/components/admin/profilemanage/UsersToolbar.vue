<script setup>
import { Search } from 'lucide-vue-next'

defineProps({
  search: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, required: true },
  roleOptions: { type: Array, required: true },
  statusOptions: { type: Array, required: true },
})

defineEmits(['update:search', 'update:role', 'update:status'])
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <div class="relative flex-1">
      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        :value="search"
        @input="$emit('update:search', $event.target.value)"
        type="text"
        placeholder="Cari nama atau email..."
        class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0F172A] placeholder:text-slate-400 transition-shadow focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10"
      />
    </div>

    <select
      :value="role"
      @change="$emit('update:role', $event.target.value)"
      class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0F172A] transition-shadow focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10 sm:w-44"
    >
      <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>

    <select
      :value="status"
      @change="$emit('update:status', $event.target.value)"
      class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0F172A] transition-shadow focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10 sm:w-44"
    >
      <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>