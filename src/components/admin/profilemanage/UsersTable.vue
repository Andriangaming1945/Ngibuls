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
  <div class="mt-6 hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
    <table class="w-full text-left text-sm">
      <thead class="border-b border-slate-200 text-xs font-medium text-[#64748B]">
        <tr>
          <th class="px-5 py-3">Pengguna</th>
          <th class="px-5 py-3">Role</th>
          <th class="px-5 py-3">Status</th>
          <th class="px-5 py-3">Login Terakhir</th>
          <th class="px-5 py-3 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-if="loading">
          <td colspan="5" class="px-5 py-10 text-center text-[#64748B]">
            <Loader2 class="mx-auto h-5 w-5 animate-spin text-[#16A34A]" />
            <p class="mt-2 text-sm">Memuat data pengguna...</p>
          </td>
        </tr>

        <tr v-else-if="users.length === 0">
          <td colspan="5" class="px-5 py-10 text-center text-[#64748B]">
            Tidak ada pengguna yang cocok.
          </td>
        </tr>

        <tr v-for="user in users" :key="user.id" class="transition-colors hover:bg-slate-50">
          <td class="px-5 py-4">
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#16A34A]/10 text-sm font-semibold text-[#16A34A]">
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
          </td>
          <td class="px-5 py-4">
            <span class="inline-flex items-center gap-1.5 text-sm text-[#0F172A]">
              <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: user.roleColorHex }" />
              {{ user.roleLabelText }}
            </span>
          </td>
          <td class="px-5 py-4">
            <button
              type="button"
              @click="$emit('toggle-status', user)"
              :disabled="statusUpdatingId === user.id"
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60"
              :class="user.status === 'active'
                ? 'bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20'
                : 'bg-red-50 text-red-600 hover:bg-red-100'"
            >
              <Loader2 v-if="statusUpdatingId === user.id" class="h-3 w-3 animate-spin" />
              <span v-else class="h-1.5 w-1.5 rounded-full" :class="user.status === 'active' ? 'bg-[#16A34A]' : 'bg-red-500'" />
              {{ user.status === 'active' ? 'Aktif' : 'Nonaktif' }}
            </button>
          </td>
          <td class="px-5 py-4 text-xs text-[#64748B]">{{ user.lastLoginText }}</td>
          <td class="px-5 py-4">
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                @click="$emit('edit', user)"
                aria-label="Edit pengguna"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[#64748B] transition-colors hover:border-slate-300 hover:text-[#0F172A]"
              >
                <Pencil class="h-4 w-4" />
              </button>
              <button
                type="button"
                @click="!user.isSelf && $emit('delete', user)"
                :disabled="user.isSelf"
                :aria-label="user.isSelf ? 'Tidak bisa menghapus akun sendiri' : 'Hapus pengguna'"
                :title="user.isSelf ? 'Tidak bisa menghapus akun sendiri' : ''"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-red-500 transition-colors hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>