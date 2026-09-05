<script setup>
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-vue-next'

defineProps({
  // Array dari priorityListFor(): [{ level, text }, ...], urutan tetap
  // [Prioritas Tinggi, Prioritas Sedang, Mudah Dilakukan].
  priority: { type: Array, default: () => [] },
})

const style = [
  { icon: AlertTriangle, dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
  { icon: AlertCircle, dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
  { icon: CheckCircle2, dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
]
</script>

<template>
  <div class="space-y-1.5">
    <div
      v-for="(p, i) in priority"
      :key="p.level"
      class="priority-row flex items-start gap-2 rounded-lg border px-2.5 py-1.5 transition-transform duration-200 hover:translate-x-0.5"
      :class="[style[i]?.bg, style[i]?.border]"
      :style="{ animationDelay: `${i * 90}ms` }"
    >
      <span class="relative mt-1 h-1.5 w-1.5 shrink-0 rounded-full" :class="style[i]?.dot">
        <span class="absolute inset-0 animate-ping rounded-full opacity-60" :class="style[i]?.dot" />
      </span>
      <p class="text-xs leading-snug">
        <span class="font-semibold" :class="style[i]?.text">{{ p.level }}:</span>
        <span class="text-slate-600"> {{ p.text }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.priority-row {
  animation: slideIn 0.4s ease both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>