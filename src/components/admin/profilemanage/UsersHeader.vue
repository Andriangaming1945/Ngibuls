<script setup>
import { Users as UsersIcon, Plus } from 'lucide-vue-next'

defineEmits(['create'])
</script>

<template>
  <div class="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
    <div class="flex items-center gap-3">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#16A34A]/10">
        <UsersIcon class="h-5 w-5 text-[#16A34A]" />
      </span>
      <div>
        <h1 class="text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">
          Manajemen Akun Pengguna
        </h1>
        <p class="mt-0.5 text-sm text-[#64748B]">Kelola akun, role, dan status pengguna pada sistem.</p>
      </div>
    </div>

    <button
      type="button"
      @click="$emit('create')"
      class="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(22,163,74,0.5)] transition-colors hover:bg-[#15803D]"
    >
      <Plus class="h-4 w-4" />
      Tambah Pengguna
    </button>
  </div>
</template>