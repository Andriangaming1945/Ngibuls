<script setup>
import { ref, computed } from 'vue'
import { Eye, Pencil, MoreVertical, Trash2, PackageSearch, Loader2 } from 'lucide-vue-next'
import CategoryBadge from './CategoryBadge.vue'
import StatusBadge from './StatusBadge.vue'
import DeviceAvatar from './DeviceAvatar.vue'

const props = defineProps({
  devices: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['view', 'edit', 'delete', 'toggle-select', 'toggle-select-all'])

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
  <div class="relative mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div v-if="openMenuId" class="fixed inset-0 z-10" @click="openMenuId = null"></div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          <tr>
            <th class="w-12 px-5 py-3.5">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="$emit('toggle-select-all')"
                class="h-4 w-4 rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A]"
              />
            </th>
            <th class="w-14 px-5 py-3.5">No</th>
            <th class="px-5 py-3.5">Perangkat</th>
            <th class="px-5 py-3.5">Kategori</th>
            <th class="px-5 py-3.5">Daya Default</th>
            <th class="px-5 py-3.5">Satuan</th>
            <th class="px-5 py-3.5">Status</th>
            <th class="px-5 py-3.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td colspan="8" class="px-5 py-16">
              <div class="flex flex-col items-center justify-center gap-2 text-[#64748B]">
                <Loader2 class="h-5 w-5 animate-spin text-[#16A34A]" />
                <span class="text-sm">Memuat data perangkat...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="devices.length === 0">
            <td colspan="8" class="px-5 py-16">
              <div class="flex flex-col items-center justify-center gap-2 text-[#64748B]">
                <PackageSearch class="h-8 w-8 text-slate-300" />
                <span class="text-sm">Belum ada perangkat.</span>
              </div>
            </td>
          </tr>
          <tr
            v-for="(d, i) in devices"
            :key="d.id"
            class="group transition-colors"
            :class="isSelected(d.id) ? 'bg-[#16A34A]/5' : 'hover:bg-slate-50'"
          >
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
            <td class="px-5 py-4 font-medium text-[#0F172A]">{{ d.watt }} W</td>
            <td class="px-5 py-4 text-[#64748B]">{{ d.unit }}</td>
            <td class="px-5 py-4"><StatusBadge :status="d.status" /></td>
            <td class="px-5 py-4">
              <div class="relative flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  @click="$emit('view', d)"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-slate-100 hover:text-[#0F172A]"
                >
                  <Eye class="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  @click="$emit('edit', d)"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-slate-100 hover:text-[#0F172A]"
                >
                  <Pencil class="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  @click="toggleMenu(d.id)"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-slate-100 hover:text-[#0F172A]"
                  :class="{ 'bg-slate-100 text-[#0F172A]': openMenuId === d.id }"
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
  </div>
</template>