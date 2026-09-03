<script setup>
defineProps({ status: { type: String, required: true } })
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 text-xs font-medium"
    :class="status === 'active' ? 'text-[#16A34A]' : 'text-[#94A3B8]'"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="status === 'active' ? 'bg-[#16A34A]' : 'bg-[#94A3B8]'" />
    {{ status === 'active' ? 'Aktif' : 'Nonaktif' }}
  </span>
</template>