<script setup>
import { computed } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import CategoryBadge from './CategoryBadge.vue'
import StatusBadge from './StatusBadge.vue'
import DeviceAvatar from './DeviceAvatar.vue'

const props = defineProps({
  devices: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] },
})

defineEmits(['edit', 'delete', 'toggle-select', 'toggle-select-all'])

const allSelected = computed(
  () => props.devices.length > 0 && props.devices.every((d) => props.selectedIds.includes(d.id))
)

function isSelected(id) {
  return props.selectedIds.includes(id)
}
</script>

<template>
  <div class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
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
          <td class="px-5 py-4 text-[#0F172A]">{{ d.default_watt }} W</td>
          <td class="px-5 py-4 text-[#64748B]">{{ d.unit }}</td>
          <td class="px-5 py-4"><StatusBadge :status="d.status" /></td>
          <td class="px-5 py-4">
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                @click="$emit('edit', d)"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[#64748B] hover:border-slate-300 hover:text-[#0F172A]"
              >
                <Pencil class="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                @click="$emit('delete', d)"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[#64748B] hover:border-red-200 hover:text-red-600"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>