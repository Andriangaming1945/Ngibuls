<script setup>
import { ref, computed, nextTick } from 'vue'
import { Eye, Pencil, MoreVertical, Trash2, PackageSearch, Loader2, ChevronDown } from 'lucide-vue-next'
import CategoryBadge from './CategoryBadge.vue'
import DeviceAvatar from './DeviceAvatar.vue'

const props = defineProps({
  devices: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['view', 'edit', 'delete', 'toggle-select', 'toggle-select-all', 'update-status'])

const allSelected = computed(
  () => props.devices.length > 0 && props.devices.every((d) => props.selectedIds.includes(d.id))
)

function isSelected(id) {
  return props.selectedIds.includes(id)
}

// --- Dropdown status (di-teleport ke body supaya gak keclip overflow tabel) ---
const openStatusId = ref(null)
const statusMenuStyle = ref({})

async function toggleStatusMenu(id, event) {
  openMenuId.value = null
  if (openStatusId.value === id) {
    openStatusId.value = null
    return
  }
  openStatusId.value = id
  await nextTick()
  positionMenu(event.currentTarget, statusMenuStyle)
}

function selectStatus(device, status) {
  openStatusId.value = null
  if (device.status === status) return
  emit('update-status', { device, status })
}

const statusOptions = [
  { value: 'active', label: 'Aktif', dot: 'bg-[#16A34A]' },
  { value: 'inactive', label: 'Nonaktif', dot: 'bg-slate-400' },
]

function statusLabel(status) {
  return statusOptions.find((s) => s.value === status)?.label || 'Aktif'
}
function statusDot(status) {
  return statusOptions.find((s) => s.value === status)?.dot || 'bg-[#16A34A]'
}

// --- Menu Aksi (titik tiga), sama-sama di-teleport ---
const openMenuId = ref(null)
const actionMenuStyle = ref({})

async function toggleMenu(id, event) {
  openStatusId.value = null
  if (openMenuId.value === id) {
    openMenuId.value = null
    return
  }
  openMenuId.value = id
  await nextTick()
  positionMenu(event.currentTarget, actionMenuStyle, 'right')
}

function handleDelete(device) {
  openMenuId.value = null
  emit('delete', device)
}

function positionMenu(buttonEl, styleRef, align = 'left') {
  const rect = buttonEl.getBoundingClientRect()
  const style = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    zIndex: 9999,
  }
  if (align === 'right') {
    style.right = `${window.innerWidth - rect.right}px`
  } else {
    style.left = `${rect.left}px`
  }
  styleRef.value = style
}

function closeMenus() {
  openStatusId.value = null
  openMenuId.value = null
}
</script>

<template>
  <div class="relative mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
            <td class="px-5 py-4 text-[#64748B]">{{ d.unit_count }} {{ d.unit }}</td>
            <td class="px-5 py-4">
              <button
                type="button"
                @click="toggleStatusMenu(d.id, $event)"
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                :class="d.status === 'active'
                  ? 'bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/15'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="statusDot(d.status)"></span>
                {{ statusLabel(d.status) }}
                <ChevronDown class="h-3 w-3" />
              </button>
            </td>
            <td class="px-5 py-4">
              <div class="flex items-center justify-end gap-1.5">
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
                  @click="toggleMenu(d.id, $event)"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-slate-100 hover:text-[#0F172A]"
                  :class="{ 'bg-slate-100 text-[#0F172A]': openMenuId === d.id }"
                >
                  <MoreVertical class="h-3.5 w-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Dropdown di-teleport ke body: keluar dari overflow tabel, gak tenggelam -->
  <Teleport to="body">
    <div v-if="openStatusId || openMenuId" class="fixed inset-0 z-[9998]" @click="closeMenus"></div>

    <div
      v-if="openStatusId"
      :style="statusMenuStyle"
      class="w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
    >
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        type="button"
        @click="selectStatus(devices.find((d) => d.id === openStatusId), opt.value)"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
        :class="devices.find((d) => d.id === openStatusId)?.status === opt.value ? 'font-semibold text-[#0F172A]' : 'text-[#64748B]'"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="opt.dot"></span>
        {{ opt.label }}
      </button>

      <!-- Penjelasan fungsi, biar admin paham konsekuensi sebelum pilih -->
      <div class="border-t border-slate-100 bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-[#64748B]">
        <span class="font-semibold text-[#0F172A]">Nonaktif:</span> perangkat disembunyikan dari pilihan user saat analisis, tapi data yang sudah tersimpan tetap ada di database — tidak terhapus. Bisa diaktifkan kembali kapan saja.
      </div>
    </div>

    <div
      v-if="openMenuId"
      :style="actionMenuStyle"
      class="w-36 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
    >
      <button
        type="button"
        @click="handleDelete(devices.find((d) => d.id === openMenuId))"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 class="h-3.5 w-3.5" />
        Hapus
      </button>
    </div>
  </Teleport>
</template>