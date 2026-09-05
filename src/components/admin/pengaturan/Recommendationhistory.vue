<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Eye, Trash2 } from 'lucide-vue-next'
import { useSavedRecommendations } from '@/composables/Userecommendationrules.js'
import DeleteConfirmModal from '@/components/admin/laporandata/DeleteConfirmModal.vue'

const {
  savedRecommendations,
  loading,
  fetchSavedRecommendations,
  deleteSavedRecommendation,
} = useSavedRecommendations()

onMounted(() => {
  fetchSavedRecommendations()
})

const search = ref('')
const typeFilter = ref('')

const filteredData = computed(() => {
  let rows = savedRecommendations.value
  if (typeFilter.value) {
    rows = rows.filter((r) => r.contributor_type === typeFilter.value)
  }
  if (search.value.trim()) {
    const term = search.value.trim().toLowerCase()
    rows = rows.filter(
      (r) =>
        r.contributor_name?.toLowerCase().includes(term) ||
        r.profiles?.name?.toLowerCase().includes(term) ||
        r.profiles?.email?.toLowerCase().includes(term),
    )
  }
  return rows
})

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

function formatNumber(val) {
  if (val === null || val === undefined) return '-'
  return new Intl.NumberFormat('id-ID').format(val)
}

const showDetail = ref(false)
const activeItem = ref(null)

function openDetail(item) {
  activeItem.value = item
  showDetail.value = true
}

const showDelete = ref(false)
const itemToDelete = ref(null)
const deleting = ref(false)

function askDelete(item) {
  itemToDelete.value = item
  showDelete.value = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    await deleteSavedRecommendation(itemToDelete.value.id)
    showDelete.value = false
    itemToDelete.value = null
  } catch (err) {
    console.error(err)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div>
      <h2 class="text-lg font-semibold text-[#0F172A]">Riwayat Rekomendasi</h2>
      <p class="mt-0.5 text-sm text-[#64748B]">
        Rekomendasi yang dihasilkan dan disimpan otomatis dari hasil analisis pengguna.
      </p>
    </div>

    <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            v-model="search"
            type="text"
            placeholder="Cari nama pengguna atau perangkat..."
            class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 sm:w-72"
          />
        </div>
        <select
          v-model="typeFilter"
          class="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 sm:w-44"
        >
          <option value="">Semua Jenis</option>
          <option value="device">Listrik</option>
          <option value="water">Air</option>
        </select>
      </div>
    </div>

    <div class="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <table class="w-full min-w-[900px] text-left text-sm">
        <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          <tr>
            <th class="px-4 py-3">Tanggal</th>
            <th class="px-4 py-3">Pengguna</th>
            <th class="px-4 py-3">Kontributor</th>
            <th class="px-4 py-3">Jenis</th>
            <th class="px-4 py-3">Potensi Hemat</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-6 text-center text-[#64748B]">Memuat data...</td>
          </tr>
          <tr v-else-if="filteredData.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-[#64748B]">
              Belum ada rekomendasi yang tersimpan.
            </td>
          </tr>
          <tr v-for="item in filteredData" :key="item.id" class="text-[#0F172A]">
            <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(item.created_at) }}</td>
            <td class="px-4 py-3">
              <div class="font-medium">{{ item.profiles?.name || '-' }}</div>
              <div class="text-xs text-[#64748B]">{{ item.profiles?.email || '-' }}</div>
            </td>
            <td class="px-4 py-3">{{ item.contributor_name }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="item.contributor_type === 'device' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'"
              >
                {{ item.contributor_type === 'device' ? 'Listrik' : 'Air' }}
              </span>
            </td>
            <td class="px-4 py-3 font-medium text-[#16A34A]">
              Rp {{ formatNumber(item.potential_saving_cost) }}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  @click="openDetail(item)"
                  class="rounded-lg border border-slate-200 p-1.5 text-[#0F172A] hover:bg-slate-50"
                  title="Detail"
                >
                  <Eye class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  @click="askDelete(item)"
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

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showDetail && activeItem"
        class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 class="text-base font-semibold text-[#0F172A]">Detail Rekomendasi</h3>
            <button
              type="button"
              @click="showDetail = false"
              class="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-50"
            >
              ✕
            </button>
          </div>
          <div class="space-y-4 px-6 py-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Pengguna</p>
              <p class="mt-1 text-sm font-medium text-[#0F172A]">
                {{ activeItem.profiles?.name }} ({{ activeItem.profiles?.email }})
              </p>
            </div>
            <div class="flex gap-8">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Kontributor</p>
                <p class="mt-1 text-sm text-[#0F172A]">{{ activeItem.contributor_name }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Nilai Saat Ini → Saran</p>
                <p class="mt-1 text-sm text-[#0F172A]">
                  {{ formatNumber(activeItem.current_value) }} → {{ formatNumber(activeItem.suggested_value) }}
                </p>
              </div>
            </div>
            <div class="flex gap-8">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Potensi Hemat (Rp)</p>
                <p class="mt-1 text-sm font-semibold text-[#16A34A]">
                  Rp {{ formatNumber(activeItem.potential_saving_cost) }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Total Biaya</p>
                <p class="mt-1 text-sm text-[#0F172A]">Rp {{ formatNumber(activeItem.total_cost) }}</p>
              </div>
            </div>
          </div>
          <div class="flex justify-end border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              @click="showDetail = false"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <DeleteConfirmModal
      :show="showDelete"
      title="Hapus Riwayat Rekomendasi?"
      message="Apakah kamu yakin ingin menghapus riwayat rekomendasi ini?"
      :loading="deleting"
      @confirm="confirmDelete"
      @close="showDelete = false"
    />
  </div>
</template>