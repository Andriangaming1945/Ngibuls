<script setup>
import { ref, computed, onMounted } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CheckCircle2 } from 'lucide-vue-next'
import { useDeviceCatalog } from '@/composables/Usedevicecatalog'
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

const PAGE_SIZE = 7
const search = ref('')
const categoryFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const selectedIds = ref([])
const exporting = ref(false)

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
      status: form.value.status,
    })
    showFormModal.value = false
  } catch (err) {
    formError.value = err.message || 'Gagal menyimpan perangkat.'
  }
}

// Ubah status langsung dari dropdown di tabel (tanpa buka form edit).
// Ini yang mengisi/mengosongkan deleted_at, bukan updateDevice biasa.
async function handleUpdateStatus({ device, status }) {
  try {
    await setDeviceActiveStatus(device.id, status)
    fireToast(
      status === 'inactive'
        ? `"${device.name}" dinonaktifkan. Data tetap tersimpan di database.`
        : `"${device.name}" diaktifkan kembali.`
    )
  } catch (err) {
    // error sudah ke-set di composable (error.value) kalau gagal
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
function formatRupiah(n) {
  return `Rp${Number(n || 0).toLocaleString('id-ID')}`
}

// --- Daftar Prioritas untuk PDF ---
// Sama persis dengan logika di komponen rekomendasi & DeviceDetailModal:
// budget_preference cuma 'none' | 'low' | 'invest', tips-nya statis per
// preferensi. Prioritas Tinggi dihitung dari current_value & suggested_value
// milik rekomendasi itu sendiri, bukan field baru.
const budgetPreferenceLabel = {
  none: 'Tanpa Biaya',
  low: 'Budget Rendah',
  invest: 'Bersedia Investasi',
}

const tipsByPreference = {
  none: [
    'Matikan perangkat saat tidak digunakan, jangan biarkan menyala tanpa alasan.',
    'Cabut charger atau adaptor yang masih tertancap meski tidak dipakai.',
  ],
  low: [
    'Ganti lampu rumah ke jenis LED yang lebih hemat listrik.',
    'Gunakan power strip dengan saklar supaya gampang mematikan beberapa perangkat sekaligus.',
  ],
  invest: [
    'Pertimbangkan perangkat dengan rating efisiensi energi lebih tinggi (misal AC inverter).',
    'Gunakan shower head hemat air untuk mengurangi konsumsi air harian.',
  ],
}

function priorityListFor(r, deviceName) {
  const tips = tipsByPreference[r.budget_preference] || tipsByPreference.none
  return [
    {
      level: 'Prioritas Tinggi',
      text: `Kurangi jam pemakaian ${deviceName} dari ${r.current_value} ke ${r.suggested_value} — dampaknya paling besar terhadap tagihan.`,
    },
    {
      level: 'Prioritas Sedang',
      text: tips[1] || tips[0],
    },
    {
      level: 'Mudah Dilakukan',
      text: tips[0],
    },
  ]
}

async function exportPDF() {
  exporting.value = true
  try {
    const rows = selectedIds.value.length > 0
      ? catalog.value.filter((d) => selectedIds.value.includes(d.id))
      : filtered.value

    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.getHeight()

    doc.setFontSize(16)
    doc.setTextColor(15, 23, 42)
    doc.text('Daftar Perangkat Listrik - Ngibuls', 14, 18)

    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    const exportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    doc.text(`Diekspor pada ${exportDate}`, 14, 24)

    autoTable(doc, {
      startY: 30,
      head: [['No', 'Perangkat', 'Kategori', 'Daya Default', 'Satuan', 'Status']],
      body: rows.map((d, i) => [
        i + 1,
        d.name,
        d.category,
        `${d.watt} W`,
        `${d.unit_count ?? 1} ${d.unit}`,
        d.status === 'active' ? 'Aktif' : 'Nonaktif',
      ]),
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 4, textColor: [15, 23, 42] },
      margin: { left: 14, right: 14 },
    })

    let cursorY = doc.lastAutoTable.finalY + 10

    function ensureSpace(minSpace) {
      if (cursorY > pageHeight - minSpace) {
        doc.addPage()
        cursorY = 20
      }
    }

    for (const d of rows) {
      // Tidak lagi dedupe berdasarkan isi row — setiap row punya id unik dari
      // DB, jadi rekomendasi dengan isi kebetulan sama tetap ditampilkan semua.
      const recs = await fetchDeviceRecommendations(d.name)
      if (!recs || recs.length === 0) continue

      ensureSpace(40)

      doc.setFontSize(11)
      doc.setTextColor(15, 23, 42)
      doc.text(`Riwayat Rekomendasi: ${d.name}`, 14, cursorY)
      cursorY += 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Pengguna', 'Dari', 'Ke', 'Potensi Hemat/Bulan', 'Preferensi', 'Tanggal']],
        body: recs.map((r) => [
          r.profiles?.name || r.profiles?.email || '-',
          r.current_value,
          r.suggested_value,
          formatRupiah(r.potential_saving_cost),
          budgetPreferenceLabel[r.budget_preference] || 'Tanpa Biaya',
          new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        ]),
        headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3, textColor: [15, 23, 42] },
        margin: { left: 14, right: 14 },
      })

      cursorY = doc.lastAutoTable.finalY + 6

      for (const r of recs) {
        ensureSpace(45)

        const userLabel = r.profiles?.name || r.profiles?.email || 'Pengguna tidak diketahui'
        const dateLabel = new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

        doc.setFontSize(9.5)
        doc.setTextColor(51, 65, 85)
        doc.text(`Detail Prioritas — ${userLabel} (${dateLabel})`, 14, cursorY)
        cursorY += 3

        autoTable(doc, {
          startY: cursorY,
          head: [['Tingkat Prioritas', 'Penjelasan']],
          body: priorityListFor(r, d.name).map((p) => [p.level, p.text]),
          headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 8 },
          styles: { fontSize: 8, cellPadding: 3, textColor: [15, 23, 42] },
          columnStyles: { 0: { cellWidth: 35 } },
          margin: { left: 14, right: 14 },
        })

        cursorY = doc.lastAutoTable.finalY + 6
      }

      cursorY += 4
    }

    doc.save('perangkat-listrik.pdf')
  } finally {
    exporting.value = false
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
      <button
        type="button"
        :disabled="exporting"
        @click="exportPDF"
        class="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ exporting ? 'Mengekspor...' : 'Export PDF' }}
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

  <!-- Toast keberhasilan ubah status -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showToast"
        class="fixed bottom-6 right-6 z-[9999] flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg"
      >
        <CheckCircle2 class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#16A34A]" />
        <p class="max-w-xs text-sm text-[#0F172A]">{{ toastMessage }}</p>
      </div>
    </Transition>
  </Teleport>
</template>