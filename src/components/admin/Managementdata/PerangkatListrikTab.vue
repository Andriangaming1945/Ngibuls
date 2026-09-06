<script setup>
import { ref, computed, onMounted } from 'vue'
import { CheckCircle2 } from 'lucide-vue-next'
import { useDeviceCatalog } from '@/composables/useDeviceCatalog.js'
import { useExportLog } from '@/composables/Useexportlog'
import { buildExportPdf } from '@/utils/Buildexportpdf'
import { downloadExportExcel } from '@/utils/Buildexportexcel'
import DeviceCatalogToolbar from './DeviceCatalogToolbar.vue'
import DeviceCatalogTable from './DeviceCatalogTable.vue'
import DeviceFormModal from './DeviceCatalogFormModal.vue'
import DeleteConfirmModal from './DeleteConfirmModal.vue'
import DeviceDetailModal from './DeviceDetailModal.vue'

const {
  catalog,
  loading,
  saving,
  fetchCatalog,
  fetchDeviceDetail,
  fetchDeviceRecommendations,
  updateDevice,
  setDeviceActiveStatus,
  deleteDevice,
} = useDeviceCatalog()

const { logExport } = useExportLog()

const PAGE_SIZE = 7
const search = ref('')
const categoryFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const selectedIds = ref([])
const exporting = ref(false)
const exportingExcel = ref(false)

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

// --- Toast keberhasilan ubah status ---
const toastMessage = ref('')
const showToast = ref(false)
let toastTimer = null

function fireToast(message) {
  toastMessage.value = message
  showToast.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// --- Detail modal ---
const showDetailModal = ref(false)
const detailLoading = ref(false)
const detailDevice = ref({})
const detailUsageRows = ref([])
const detailRecommendationRows = ref([])

async function openDetail(device) {
  detailDevice.value = device
  showDetailModal.value = true
  detailLoading.value = true
  try {
    const [usage, recs] = await Promise.all([
      fetchDeviceDetail(device.name),
      fetchDeviceRecommendations(device.name),
    ])
    detailUsageRows.value = usage
    detailRecommendationRows.value = recs
  } finally {
    detailLoading.value = false
  }
}

// --- Edit modal ---
const showFormModal = ref(false)
const formError = ref('')
const form = ref({ id: null, name: '', category: '', defaultWatt: 0, unit: 'unit', status: 'active' })

function openEdit(device) {
  form.value = {
    id: device.id,
    name: device.name,
    category: device.category,
    defaultWatt: device.watt,
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
      watt: form.value.defaultWatt,
      unit: form.value.unit,
    })
    showFormModal.value = false
  } catch (err) {
    formError.value = err.message || 'Gagal menyimpan perangkat.'
  }
}



// --- Delete modal ---
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
    fireToast(`"${deviceToDelete.value.name}" dinonaktifkan. Data tetap tersimpan di database.`)
  } finally {
    deleting.value = false
  }
}

// --- Export PDF ---
// Scope export: 'single' (1 perangkat dicentang), 'selected' (lebih dari 1
// dicentang), atau 'all' (tidak ada yang dicentang -> export semua yang
// sedang tampil sesuai filter aktif). Dipakai juga sebagai label di
// halaman Laporan.
function resolveScope() {
  if (selectedIds.value.length === 0) return 'all'
  if (selectedIds.value.length === 1) return 'single'
  return 'selected'
}

// Dipakai bareng oleh exportPDF() dan exportExcel() supaya data yang
// difetch/dicatat ke export_logs selalu sama, tidak dobel logic.
async function buildExportPayload() {
  const rows = selectedIds.value.length > 0
    ? catalog.value.filter((d) => selectedIds.value.includes(d.id))
    : filtered.value

  const payload = []

  for (const d of rows) {
    const recs = await fetchDeviceRecommendations(d.name)
    payload.push({
      id: d.id,
      name: d.name,
      category: d.category,
      watt: d.watt,
      unit: d.unit,
      unit_count: d.unit_count ?? 1,
      recommendations: (recs || []).map((r) => ({
        user_label: r.profiles?.name || r.profiles?.email || 'Pengguna tidak diketahui',
        current_value: r.current_value,
        suggested_value: r.suggested_value,
        potential_saving_cost: r.potential_saving_cost,
        budget_preference: r.budget_preference,
        created_at: r.created_at,
      })),
    })
  }

  return payload
}

async function exportPDF() {
  exporting.value = true
  try {
    const exportPayload = await buildExportPayload()
    const fileName = 'perangkat-listrik.pdf'
    buildExportPdf(exportPayload).save(fileName)
    await logExport({ scope: resolveScope(), fileName, payload: exportPayload })
  } finally {
    exporting.value = false
  }
}

async function exportExcel() {
  exportingExcel.value = true
  try {
    const exportPayload = await buildExportPayload()
    const fileName = 'perangkat-listrik.xlsx'
    await downloadExportExcel(exportPayload, fileName)
    await logExport({ scope: resolveScope(), fileName, payload: exportPayload })
  } finally {
    exportingExcel.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-[#0F172A]">Daftar Perangkat Listrik</h2>
        <p class="mt-0.5 text-sm text-[#64748B]">Master perangkat listrik yang dapat dipilih oleh user saat analisis.</p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          :disabled="exportingExcel"
          @click="exportExcel"
          class="flex items-center justify-center gap-2 rounded-xl border border-[#16A34A] px-4 py-2.5 text-sm font-semibold text-[#16A34A] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FileSpreadsheet class="h-4 w-4" />
          {{ exportingExcel ? 'Mengekspor...' : 'Export Excel' }}
        </button>
        <button
          type="button"
          :disabled="exporting"
          @click="exportPDF"
          class="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ exporting ? 'Mengekspor...' : 'Export PDF' }}
        </button>
      </div>
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
      @view="openDetail"
      @edit="openEdit"
      @delete="confirmDelete"
      @toggle-select="toggleSelect"
      @toggle-select-all="toggleSelectAll"
      @update-status="handleUpdateStatus"
    />

    <div v-if="totalCount > 0" class="mt-4 flex items-center justify-between text-sm text-[#64748B]">
      <p>Menampilkan {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, totalCount) }} dari {{ totalCount }} data</p>
      <div class="flex items-center gap-2">
        <button type="button" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">‹</button>
        <span v-for="p in totalPages" :key="p" class="cursor-pointer rounded-lg px-3 py-1.5" :class="p === currentPage ? 'bg-[#16A34A] text-white' : 'border border-slate-200'" @click="goToPage(p)">{{ p }}</span>
        <button type="button" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">›</button>
      </div>
    </div>

    <DeviceDetailModal
      :show="showDetailModal"
      :device="detailDevice"
      :usage-rows="detailUsageRows"
      :recommendation-rows="detailRecommendationRows"
      :loading="detailLoading"
      @close="showDetailModal = false"
    />

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