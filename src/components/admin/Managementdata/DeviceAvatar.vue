<script setup>
import { Snowflake, ChefHat, Droplets, Laptop2, Lightbulb, Zap } from 'lucide-vue-next'

defineProps({ category: { type: String, required: true } })

const iconMap = {
  Pendingin: Snowflake,
  Dapur: ChefHat,
  'Peralatan Air': Droplets,
  Elektronik: Laptop2,
  Pencahayaan: Lightbulb,
}

const colorMap = {
  Pendingin: 'bg-sky-100 text-sky-600',
  Dapur: 'bg-amber-100 text-amber-600',
  'Peralatan Air': 'bg-violet-100 text-violet-600',
  Elektronik: 'bg-blue-100 text-blue-600',
  Pencahayaan: 'bg-emerald-100 text-emerald-600',
}

function iconFor(category) {
  return iconMap[category] || Zap
}
function colorFor(category) {
  return colorMap[category] || 'bg-slate-100 text-slate-600'
}
</script>

<template>
  <span class="inline-flex h-9 w-9 items-center justify-center rounded-full" :class="colorFor(category)">
    <component :is="iconFor(category)" class="h-4 w-4" />
  </span>
</template>