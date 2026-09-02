<script setup>
import { Pencil, Trash2, Loader2 } from 'lucide-vue-next'

defineProps({
  users: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  statusUpdatingId: { type: [String, Number, null], default: null },
})

defineEmits(['edit', 'delete', 'toggle-status'])

function initial(name, email) {
  return (name || email || '?').trim().charAt(0).toUpperCase()
}
</script>

<template>
  <div class="mt-6 space-y-3 md:hidden">
    <div v-if="loading" class="rounded-xl border border-slate-200 bg-white p-6 text-center text-[#64748B]">
      <Loader2 class="mx-auto h-5 w-5 animate-spin text-[#16A34A]" />
      <p class="mt-2 text-sm">Memuat data pengguna...</p>
    </div>

    <div v-else-if="users.length === 0" class="rounded-xl border border-slate-200 bg-white p-6 text-center text-[#64748B]">
      Tidak ada pengguna yang cocok.
    </div>

    <div v-for="user in users" :key="user.id" class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#16A34A]/10 text-sm font-semibold text-[#16A34A]">
            <img v-if="user.avatar_url" :src="user.avatar_url" alt="" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
            <span v-else>{{ initial(user.name, user.email) }}</span>
          </span>
          <div class="min-w-0">
            <p class="flex items-center gap-1.5 truncate text-sm font-medium text-[#0F172A]">
              {{ user.name || '-' }}
              <span v-if="user.isSelf" class="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-[#64748B]">Kamu</span>
            </p>
            <p class="truncate text-xs text-[#64748B]">{{ user.email }}</p>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            @click="$emit('edit', user)"
            aria-label="Edit pengguna"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[#64748B]"
          >
            <Pencil class="h-4 w-4" />
          </button>
          <button
            type="button"
            @click="!user.isSelf && $emit('delete', user)"
            :disabled="user.isSelf"
            :title="user.isSelf ? 'Tidak bisa menghapus akun sendiri' : ''"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-red-500 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <span class="inline-flex items-center gap-1.5 text-sm text-[#0F172A]">
          <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: user.roleColorHex }" />
          {{ user.roleLabelText }}
        </span>

        <button
          type="button"
          @click="$emit('toggle-status', user)"
          :disabled="statusUpdatingId === user.id"
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-60"
          :class="user.status === 'active' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-red-50 text-red-600'"
        >
          <Loader2 v-if="statusUpdatingId === user.id" class="h-3 w-3 animate-spin" />
          <span v-else class="h-1.5 w-1.5 rounded-full" :class="user.status === 'active' ? 'bg-[#16A34A]' : 'bg-red-500'" />
          {{ user.status === 'active' ? 'Aktif' : 'Nonaktif' }}
        </button>

        <span class="text-xs text-[#94A3B8]">Login: {{ user.lastLoginText }}</span>
      </div>
    </div>
  </div>
</template>