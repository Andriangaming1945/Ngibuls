<script setup>
defineProps({
  icon: { type: [Object, Function], required: true },
  iconBg: { type: String, default: 'bg-slate-100' },
  iconColor: { type: String, default: 'text-slate-500' },
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  loading: { type: Boolean, default: false },
  index: { type: Number, default: 0 },
})
</script>

<template>
  <div
    class="stat-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70"
    :style="{ animationDelay: `${index * 90}ms` }"
  >
    <!-- glow lembut di pojok, muncul pas di-hover -->
    <span
      class="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-50"
      :class="iconBg"
    />

    <div class="relative flex items-center gap-3">
      <span
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6"
        :class="iconBg"
      >
        <component :is="icon" class="h-5 w-5" :class="iconColor" />
      </span>
      <div>
        <p class="text-xs text-[#64748B]">{{ label }}</p>
        <p class="text-xl font-bold text-[#0F172A]">
          <slot v-if="loading" name="loading">
            <span class="inline-block h-4 w-4 animate-pulse rounded-full bg-slate-200" />
          </slot>
          <span v-else>{{ value }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  animation: cardIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>