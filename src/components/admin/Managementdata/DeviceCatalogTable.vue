<script setup>
import { ref, computed } from 'vue'
import { Pencil, MoreVertical, Trash2 } from 'lucide-vue-next'
import CategoryBadge from './CategoryBadge.vue'
import StatusBadge from './StatusBadge.vue'
import DeviceAvatar from './DeviceAvatar.vue'

const props = defineProps({
  devices: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['edit', 'delete', 'toggle-select', 'toggle-select-all'])

const allSelected = computed(
  () => props.devices.length > 0 && props.devices.every((d) => props.selectedIds.includes(d.id))
)

function isSelected(id) {
  return props.selectedIds.includes(id)
}

const openMenuId = ref(null)

function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function handleDelete(device) {
  openMenuId.value = null
  emit('delete', device)
}
</script>

<template>
  <div class="relative mt-4 rounded-xl border border-slate-200 bg-white">
    <div v-if="openMenuId" class="fixed inset-0 z-10" @click="openMenuId = null"></div>

    <table class="w-full text-left text-sm">
      <thead class="border-b border-slate-200 text-xs font-medium text-[#64748B]">
        <tr>
          <th class="w-12 px-5 py-3">
            <input
              type="checkbox"
              :checked="allSelected"
              @change="$emit('toggle-select-all')"
              class="h-4 w-4 rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A]"
            />
          </th>
          <th class="px-5 py-3 w-14">No</th>
          <th class="px-5 py-3">Perangkat</th>
          <th class="px-5 py-3">Kategori</th>
          <th class="px-5 py-3">Daya Default</th>
          <th class="px-5 py-3">Satuan</th>
          <th class="px-5 py-3">Status</th>
          <th class="px-5 py-3 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-if="loading">
          <td colspan="8" class="px-5 py-10 text-center text-[#64748B]">Memuat data perangkat...</td>
        </tr>
        <tr v-else-if="devices.length === 0">
          <td colspan="8" class="px-5 py-10 text-center text-[#64748B]">Belum ada perangkat.</td>
        </tr>
        <tr v-for="(d, i) in devices" :key="d.id" class="transition-colors hover:bg-slate-50">
          <td class="px-5 py-4">
            <input
              type="checkbox"
              :checked="isSelected(d.id)"
              @change="$emit('toggle-select', d.id)"
              class="h-4 w-4 rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A]"
            />
          </td>
          <td class="px-5 py-4 text-[#64748B]">{{ i + 1 }}</td>
          <td class="px-5 py-4">
            <div class="flex items-center gap-3">
              <DeviceAvatar :category="d.category" />
              <span class="font-medium text-[#0F172A]">{{ d.name }}</span>
            </div>
          </td>
          <td class="px-5 py-4"><CategoryBadge :category="d.category" /></td>
          <td class="px-5 py-4 text-[#0F172A]">{{ d.watt }} W</td>
          <td class="px-5 py-4 text-[#64748B]">{{ d.unit }}</td>
          <td class="px-5 py-4"><StatusBadge :status="d.status" /></td>
          <td class="px-5 py-4">
            <div class="relative flex items-center justify-end gap-2">
              <button
                type="button"
                @click="$emit('edit', d)"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[#64748B] hover:border-slate-300 hover:text-[#0F172A]"
              >
                <Pencil class="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                @click="toggleMenu(d.id)"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[#64748B] hover:border-slate-300 hover:text-[#0F172A]"
              >
                <MoreVertical class="h-3.5 w-3.5" />
              </button>
              <div
                v-if="openMenuId === d.id"
                class="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
              >
                <button
                  type="button"
                  @click="handleDelete(d)"
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>