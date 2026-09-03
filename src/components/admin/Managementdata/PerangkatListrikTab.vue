<script setup>
import { ref, computed, onMounted } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useDeviceCatalog } from '@/composables/Usedevicecatalog'
import DeviceCatalogToolbar from './DeviceCatalogToolbar.vue'
import DeviceCatalogTable from './DeviceCatalogTable.vue'
import DeviceFormModal from './DeviceCatalogFormModal.vue'
import DeleteConfirmModal from './DeleteConfirmModal.vue'

const { catalog, loading, saving, fetchCatalog, updateDevice, deleteDevice } = useDeviceCatalog()

const PAGE_SIZE = 7
const search = ref('')
const categoryFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const selectedIds = ref([])

onMounted(fetchCatalog)

const categoryOptions = computed(() => [...new Set(catalog.value.map((d) => d.category))])

const filtered = computed(() => {
  let rows = catalog.value
  if (search.value.trim()) {
    const term = search.value.trim().toLowerCase()
    rows = rows.filter((d) => d.name.toLowerCase().includes(term))
  }
  if (categoryFilter.value !== 'all') rows = rows.filter((d) => d.category === categoryFilter.value)
  if (statusFilter.value !== 'all') rows = rows.filter((d) => d.status === statusFilter.value)
  return rows
})

const totalCount = computed(() => filtered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE)))
const paged = computed(() => filtered.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE))

function goToPage(p) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}

function toggleSelect(id) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((x) => x !== id)
    : [...selectedIds.value, id]
}

function toggleSelectAll() {
  const idsOnPage = paged.value.map((d) => d.id)
  const allSelected = idsOnPage.every((id) => selectedIds.value.includes(id))
  selectedIds.value = allSelected
    ? selectedIds.value.filter((id) => !idsOnPage.includes(id))
    : [...new Set([...selectedIds.value, ...idsOnPage])]
}

const showFormModal = ref(false)
const formError = ref('')
const form = ref({ id: null, name: '', category: '', defaultWatt: 0, unit: 'unit', status: 'active' })

function openEdit(device) {
  form.value = {
    id: device.id,
    name: device.name,
    category: device.category,
    defaultWatt: device.default_watt,
    unit: device.unit,
    status: device.status,
  }
  formError.value = ''
  showFormModal.value = true
}

async function submitForm() {
  if (!form.value.name.trim() || !form.value.category.trim()) {
    formError.value = 'Nama dan kategori wajib diisi.'
    return
  }
  try {
    await updateDevice(form.value.id, {
      name: form.value.name,
      category: form.value.category,
      default_watt: form.value.defaultWatt,
      unit: form.value.unit,
      status: form.value.status,
    })
    showFormModal.value = false
  } catch (err) {
    formError.value = err.message || 'Gagal menyimpan perangkat.'
  }
}

const showDeleteModal = ref(false)
const deleting = ref(false)
const deviceToDelete = ref(null)

function confirmDelete(device) {
  deviceToDelete.value = device
  showDeleteModal.value = true
}

async function performDelete() {
  deleting.value = true
  try {
    await deleteDevice(deviceToDelete.value.id)
    selectedIds.value = selectedIds.value.filter((id) => id !== deviceToDelete.value.id)
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

function exportPDF() {
  const rows = selectedIds.value.length > 0
    ? catalog.value.filter((d) => selectedIds.value.includes(d.id))
    : filtered.value

  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text('Daftar Perangkat Listrik - HEMATria', 14, 16)

  autoTable(doc, {
    startY: 22,
    head: [['No', 'Perangkat', 'Kategori', 'Daya Default', 'Satuan', 'Status']],
    body: rows.map((d, i) => [
      i + 1,
      d.name,
      d.category,
      `${d.default_watt} W`,
      d.unit,
      d.status === 'active' ? 'Aktif' : 'Nonaktif',
    ]),
  })

  doc.save('perangkat-listrik.pdf')
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-[#0F172A]">Daftar Perangkat Listrik</h2>
        <p class="mt-0.5 text-sm text-[#64748B]">Master perangkat listrik yang dapat dipilih oleh user saat analisis.</p>
      </div>
      <button
        type="button"
        @click="exportPDF"
        class="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#15803D]"
      >
        Export PDF
      </button>
    </div>

    <div class="mt-5">
      <DeviceCatalogToolbar
        :search="search"
        :category="categoryFilter"
        :status="statusFilter"
        :category-options="categoryOptions"
        @update:search="search = $event; currentPage = 1"
        @update:category="categoryFilter = $event; currentPage = 1"
        @update:status="statusFilter = $event; currentPage = 1"
      />
    </div>

    <DeviceCatalogTable
      :devices="paged"
      :loading="loading"
      :selected-ids="selectedIds"
      @edit="openEdit"
      @delete="confirmDelete"
      @toggle-select="toggleSelect"
      @toggle-select-all="toggleSelectAll"
    />

    <div v-if="totalCount > 0" class="mt-4 flex items-center justify-between text-sm text-[#64748B]">
      <p>Menampilkan {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, totalCount) }} dari {{ totalCount }} data</p>
      <div class="flex items-center gap-2">
        <button type="button" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">‹</button>
        <span v-for="p in totalPages" :key="p" class="cursor-pointer rounded-lg px-3 py-1.5" :class="p === currentPage ? 'bg-[#16A34A] text-white' : 'border border-slate-200'" @click="goToPage(p)">{{ p }}</span>
        <button type="button" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">›</button>
      </div>
    </div>

    <DeviceFormModal
      :show="showFormModal"
      mode="edit"
      :form="form"
      :category-options="categoryOptions"
      :error="formError"
      :saving="saving"
      @close="showFormModal = false"
      @submit="submitForm"
    />

    <DeleteConfirmModal
      :show="showDeleteModal"
      :device-name="deviceToDelete?.name"
      :deleting="deleting"
      @close="showDeleteModal = false"
      @confirm="performDelete"
    />
  </div>
</template>