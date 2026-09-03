<script setup>
defineProps({ category: { type: String, required: true } })

const colorMap = {
  Pendingin: 'bg-sky-100 text-sky-700',
  Dapur: 'bg-amber-100 text-amber-700',
  'Peralatan Air': 'bg-violet-100 text-violet-700',
  Elektronik: 'bg-blue-100 text-blue-700',
  Pencahayaan: 'bg-emerald-100 text-emerald-700',
}

function colorFor(category) {
  return colorMap[category] || 'bg-slate-100 text-slate-700'
}
</script>

<template>
  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="colorFor(category)">
    {{ category }}
  </span>
</template>