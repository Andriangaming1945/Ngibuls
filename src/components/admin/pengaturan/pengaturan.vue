<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Eye, Pencil, Trash2 } from 'lucide-vue-next'
import DeleteConfirmModal from '@/components/admin/laporandata/DeleteConfirmModal.vue'
import RekomendasiFormModal from './RekomendasiFormModal.vue'
import RekomendasiDetailModal from './RekomendasiDetailModal.vue'
import KategoriFormModal from './KategoriFormModal.vue'
import KategoriDetailModal from './KategoriDetailModal.vue'
import { useSavedRecommendations } from '@/composables/Usesavedrecommendations.js'
import { useDeviceCategories } from '@/composables/Usedevicecategories.js'
import { useDeviceCatalog } from '@/composables/useDeviceCatalog.js'
import { useExportLog } from '@/composables/Useexportlog.js'

const activeTab = ref('rekomendasi')

// ---------- Rekomendasi ----------
const {
  recommendations,
  loading: rekLoading,
  deleting: deletingRek,
  fetchRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
} = useSavedRecommendations()

// ---------- Kategori ----------
const {
  categories: kategoriList,
  loading: katLoading,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = useDeviceCategories()

// ---------- Ringkasan Data (TIDAK DIUBAH) ----------
const { catalog: deviceCatalog, loading: catalogLoading, fetchCatalog } = useDeviceCatalog()
const { logs: exportLogs, loading: exportLoading, fetchExportLogs } = useExportLog()

onMounted(() => {
  fetchRecommendations()
  fetchCategories()
  fetchCatalog()
  fetchExportLogs()
})

function formatRupiah(n) {
  return `Rp${Math.round(Number(n || 0)).toLocaleString('id-ID')}`
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const jenisLabel = { device: 'Listrik', water: 'Air' }

// ========== TAB 1: REKOMENDASI (search + filter + CRUD) ==========
const rekSearch = ref('')
const rekJenisFilter = ref('')

const filteredRekomendasi = computed(() => {
  let rows = recommendations.value
  if (rekJenisFilter.value) {
    rows = rows.filter((r) => r.contributor_type === rekJenisFilter.value)
  }
  if (rekSearch.value.trim()) {
    const term = rekSearch.value.trim().toLowerCase()
    rows = rows.filter(
      (r) =>
        r.contributor_name?.toLowerCase().includes(term) ||
        r.profiles?.name?.toLowerCase().includes(term) ||
        r.profiles?.email?.toLowerCase().includes(term)
    )
  }
  return rows
})

// --- Tambah / Edit ---
const showRekForm = ref(false)
const editingRek = ref(null)
const savingRek = ref(false)

function openAddRek() {
  editingRek.value = null
  showRekForm.value = true
}

function openEditRek(item) {
  editingRek.value = item
  showRekForm.value = true
}

async function saveRek(data) {
  savingRek.value = true
  try {
    if (editingRek.value) {
      await updateRecommendation(editingRek.value.id, data)
    } else {
      await createRecommendation(data)
    }
    showRekForm.value = false
    editingRek.value = null
  } catch (err) {
    console.error(err)
  } finally {
    savingRek.value = false
  }
}

// --- Detail ---
const showRekDetail = ref(false)
const activeRek = ref(null)

function openRekDetail(item) {
  activeRek.value = item
  showRekDetail.value = true
}

// --- Hapus ---
const showRekDeleteModal = ref(false)
const rekToDelete = ref(null)

function askDeleteRek(item) {
  rekToDelete.value = item
  showRekDeleteModal.value = true
}

async function confirmDeleteRek() {
  try {
    await deleteRecommendation(rekToDelete.value.id)
    showRekDeleteModal.value = false
    rekToDelete.value = null
  } catch (err) {
    console.error(err)
  }
}

// ========== TAB 2: KATEGORI (search + filter + CRUD) ==========
const katSearch = ref('')
const katStatusFilter = ref('')

const filteredKategori = computed(() => {
  let rows = kategoriList.value
  if (katStatusFilter.value) {
    rows = rows.filter((k) => k.status === katStatusFilter.value)
  }
  if (katSearch.value.trim()) {
    const term = katSearch.value.trim().toLowerCase()
    rows = rows.filter((k) => k.name.toLowerCase().includes(term))
  }
  return rows
})

// --- Tambah / Edit ---
const showKatForm = ref(false)
const editingKat = ref(null)
const savingKat = ref(false)

function openAddKat() {
  editingKat.value = null
  showKatForm.value = true
}

function openEditKat(item) {
  editingKat.value = item
  showKatForm.value = true
}

async function saveKat(data) {
  savingKat.value = true
  try {
    if (editingKat.value) {
      await updateCategory(editingKat.value.id, data)
    } else {
      await createCategory(data)
    }
    showKatForm.value = false
    editingKat.value = null
  } catch (err) {
    console.error(err)
  } finally {
    savingKat.value = false
  }
}

// --- Detail ---
const showKatDetail = ref(false)
const activeKat = ref(null)

function openKatDetail(item) {
  activeKat.value = item
  showKatDetail.value = true
}

// --- Hapus ---
const showKatDeleteModal = ref(false)
const katToDelete = ref(null)
const deletingKat = ref(false)

function askDeleteKat(item) {
  katToDelete.value = item
  showKatDeleteModal.value = true
}

async function confirmDeleteKat() {
  deletingKat.value = true
  try {
    await deleteCategory(katToDelete.value.id)
    showKatDeleteModal.value = false
    katToDelete.value = null
  } catch (err) {
    console.error(err)
  } finally {
    deletingKat.value = false
  }
}

// ========== TAB 3: RINGKASAN DATA (read-only, TIDAK DIUBAH) ==========
const ringkasanSearch = ref('')

const filteredDeviceCatalog = computed(() => {
  if (!ringkasanSearch.value.trim()) return deviceCatalog.value
  const term = ringkasanSearch.value.trim().toLowerCase()
  return deviceCatalog.value.filter((d) => d.name.toLowerCase().includes(term))
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div>
      <h2 class="text-lg font-semibold text-[#0F172A]">Pengaturan</h2>
      <p class="mt-0.5 text-sm text-[#64748B]">Ringkasan rekomendasi & kategori nyata dari aktivitas pengguna.</p>
    </div>

    <!-- Tabs -->
    <div class="mt-5 flex flex-wrap gap-1 border-b border-slate-200">
      <button
        type="button"
        @click="activeTab = 'rekomendasi'"
        class="border-b-2 px-4 py-2.5 text-sm font-semibold transition"
        :class="activeTab === 'rekomendasi' ? 'border-[#16A34A] text-[#16A34A]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'"
      >
        Rekomendasi
      </button>
      <button
        type="button"
        @click="activeTab = 'kategori'"
        class="border-b-2 px-4 py-2.5 text-sm font-semibold transition"
        :class="activeTab === 'kategori' ? 'border-[#16A34A] text-[#16A34A]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'"
      >
        Kategori
      </button>
      <button
        type="button"
        @click="activeTab = 'ringkasan'"
        class="border-b-2 px-4 py-2.5 text-sm font-semibold transition"
        :class="activeTab === 'ringkasan' ? 'border-[#16A34A] text-[#16A34A]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'"
      >
        Ringkasan Data
      </button>
    </div>

    <!-- TAB 1: REKOMENDASI (CRUD) -->
    <div v-if="activeTab === 'rekomendasi'" class="mt-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              v-model="rekSearch"
              type="text"
              placeholder="Cari perangkat/aktivitas atau nama user..."
              class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 sm:w-72"
            />
          </div>
          <select
            v-model="rekJenisFilter"
            class="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 sm:w-44"
          >
            <option value="">Semua Jenis</option>
            <option value="device">Listrik</option>
            <option value="water">Air</option>
          </select>
        </div>

        <button
          type="button"
          @click="openAddRek"
          class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#15803D]"
        >
          <Plus class="h-4 w-4" />
          Tambah Rekomendasi
        </button>
      </div>

      <div class="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table class="w-full min-w-[860px] text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            <tr>
              <th class="px-4 py-3">Perangkat/Aktivitas</th>
              <th class="px-4 py-3">Jenis</th>
              <th class="px-4 py-3">Pengguna</th>
              <th class="px-4 py-3">Dari → Ke</th>
              <th class="px-4 py-3">Potensi Hemat/Bulan</th>
              <th class="px-4 py-3">Tanggal</th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="rekLoading">
              <td colspan="7" class="px-4 py-6 text-center text-[#64748B]">Memuat rekomendasi...</td>
            </tr>
            <tr v-else-if="filteredRekomendasi.length === 0">
              <td colspan="7" class="px-4 py-6 text-center text-[#64748B]">Tidak ada rekomendasi ditemukan.</td>
            </tr>
            <tr v-for="item in filteredRekomendasi" :key="item.id" class="text-[#0F172A]">
              <td class="px-4 py-3 font-medium">{{ item.contributor_name }}</td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="item.contributor_type === 'device' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'"
                >
                  {{ jenisLabel[item.contributor_type] || item.contributor_type }}
                </span>
              </td>
              <td class="px-4 py-3 text-[#64748B]">{{ item.profiles?.name || item.profiles?.email || '-' }}</td>
              <td class="px-4 py-3 text-[#64748B]">{{ item.current_value }} → {{ item.suggested_value }}</td>
              <td class="px-4 py-3 font-medium text-[#16A34A]">{{ formatRupiah(item.potential_saving_cost) }}</td>
              <td class="px-4 py-3 text-[#64748B]">{{ formatDate(item.created_at) }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    @click="openRekDetail(item)"
                    class="rounded-lg border border-slate-200 p-1.5 text-[#0F172A] hover:bg-slate-50"
                    title="Detail"
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    @click="openEditRek(item)"
                    class="rounded-lg border border-slate-200 p-1.5 text-[#0F172A] hover:bg-slate-50"
                    title="Edit"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    @click="askDeleteRek(item)"
                    class="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: KATEGORI (CRUD) -->
    <div v-else-if="activeTab === 'kategori'" class="mt-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              v-model="katSearch"
              type="text"
              placeholder="Cari kategori..."
              class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 sm:w-64"
            />
          </div>
        
        </div>

        <button
          type="button"
          @click="openAddKat"
          class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#15803D]"
        >
          <Plus class="h-4 w-4" />
          Tambah Kategori
        </button>
      </div>

      <div class="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table class="w-full min-w-[720px] text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            <tr>
              <th class="px-4 py-3">Nama Kategori</th>
              <th class="px-4 py-3">Digunakan Untuk</th>
              <th class="px-4 py-3">Jumlah Data</th>
             
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="katLoading">
              <td colspan="5" class="px-4 py-6 text-center text-[#64748B]">Memuat kategori...</td>
            </tr>
            <tr v-else-if="filteredKategori.length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-[#64748B]">Tidak ada kategori ditemukan.</td>
            </tr>
            <tr v-for="item in filteredKategori" :key="item.id" class="text-[#0F172A]">
              <td class="px-4 py-3 font-medium">{{ item.name }}</td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="item.used_for === 'Perangkat Listrik' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'"
                >
                  {{ item.used_for }}
                </span>
              </td>
              <td class="px-4 py-3 text-[#64748B]">{{ item.data_count }}</td>
            
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    @click="openKatDetail(item)"
                    class="rounded-lg border border-slate-200 p-1.5 text-[#0F172A] hover:bg-slate-50"
                    title="Detail"
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    @click="openEditKat(item)"
                    class="rounded-lg border border-slate-200 p-1.5 text-[#0F172A] hover:bg-slate-50"
                    title="Edit"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    @click="askDeleteKat(item)"
                    class="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: RINGKASAN DATA (read-only, TIDAK DIUBAH) -->
    <div v-else class="mt-5 space-y-8">
      <div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-sm font-semibold text-[#0F172A]">Ringkasan Perangkat (Manajemen Data)</h3>
            <p class="mt-0.5 text-xs text-[#64748B]">Data ini diambil langsung dari halaman Manajemen Data, bersifat baca saja.</p>
          </div>
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              v-model="ringkasanSearch"
              type="text"
              placeholder="Cari perangkat..."
              class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 sm:w-64"
            />
          </div>
        </div>

        <div class="mt-3 overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              <tr>
                <th class="px-4 py-3">Perangkat</th>
                <th class="px-4 py-3">Kategori</th>
                <th class="px-4 py-3">Rata-rata Watt</th>
                <th class="px-4 py-3">Jumlah Unit</th>
                <th class="px-4 py-3">Jumlah Pengguna</th>
                
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="catalogLoading">
                <td colspan="6" class="px-4 py-6 text-center text-[#64748B]">Memuat data perangkat...</td>
              </tr>
              <tr v-else-if="filteredDeviceCatalog.length === 0">
                <td colspan="6" class="px-4 py-6 text-center text-[#64748B]">Tidak ada data perangkat.</td>
              </tr>
              <tr v-for="item in filteredDeviceCatalog" :key="item.id" class="text-[#0F172A]">
                <td class="px-4 py-3 font-medium">{{ item.name }}</td>
                <td class="px-4 py-3 text-[#64748B]">{{ item.category }}</td>
                <td class="px-4 py-3">{{ item.watt }} W</td>
                <td class="px-4 py-3">{{ item.unit_count }} {{ item.unit }}</td>
                <td class="px-4 py-3">{{ item.user_count }}</td>
    
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-[#0F172A]">Ringkasan Riwayat Export (Laporan)</h3>
        <p class="mt-0.5 text-xs text-[#64748B]">Data ini diambil langsung dari halaman Laporan, bersifat baca saja.</p>

        <div class="mt-3 overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              <tr>
                <th class="px-4 py-3">Tanggal</th>
                <th class="px-4 py-3">File</th>
                <th class="px-4 py-3">Cakupan</th>
                <th class="px-4 py-3">Jumlah Perangkat</th>
                <th class="px-4 py-3">Diekspor Oleh</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="exportLoading">
                <td colspan="5" class="px-4 py-6 text-center text-[#64748B]">Memuat riwayat export...</td>
              </tr>
              <tr v-else-if="exportLogs.length === 0">
                <td colspan="5" class="px-4 py-6 text-center text-[#64748B]">Belum ada riwayat export.</td>
              </tr>
              <tr v-for="log in exportLogs.slice(0, 10)" :key="log.id" class="text-[#0F172A]">
                <td class="px-4 py-3">{{ formatDate(log.created_at) }}</td>
                <td class="px-4 py-3 font-medium">{{ log.file_name }}</td>
                <td class="px-4 py-3 text-[#64748B]">{{ log.scope }}</td>
                <td class="px-4 py-3">{{ log.device_count }}</td>
                <td class="px-4 py-3 text-[#64748B]">{{ log.profiles?.name || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="exportLogs.length > 10" class="mt-2 text-xs text-[#94A3B8]">
          Menampilkan 10 riwayat terbaru dari {{ exportLogs.length }} total. Lihat semua di halaman Laporan.
        </p>
      </div>
    </div>

    <!-- Modals: Rekomendasi -->
    <RekomendasiFormModal
      :show="showRekForm"
      :initial="editingRek"
      :saving="savingRek"
      @close="showRekForm = false"
      @save="saveRek"
    />
    <RekomendasiDetailModal :show="showRekDetail" :item="activeRek" @close="showRekDetail = false" />
    <DeleteConfirmModal
      :show="showRekDeleteModal"
      title="Hapus Rekomendasi?"
      message="Data rekomendasi ini akan dihapus permanen dari riwayat."
      :loading="deletingRek"
      @confirm="confirmDeleteRek"
      @close="showRekDeleteModal = false"
    />

    <!-- Modals: Kategori -->
    <KategoriFormModal
      :show="showKatForm"
      :initial="editingKat"
      :saving="savingKat"
      @close="showKatForm = false"
      @save="saveKat"
    />
    <KategoriDetailModal :show="showKatDetail" :item="activeKat" @close="showKatDetail = false" />
    <DeleteConfirmModal
      :show="showKatDeleteModal"
      title="Hapus Kategori?"
      message="Apakah kamu yakin ingin menghapus kategori ini?"
      :loading="deletingKat"
      @confirm="confirmDeleteKat"
      @close="showKatDeleteModal = false"
    />
  </div>
</template>