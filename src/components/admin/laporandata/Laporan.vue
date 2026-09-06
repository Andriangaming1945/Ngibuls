<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExportLog } from '@/composables/Useexportlog.js'
import LaporanToolbar from './Laporantoolbar.vue'
import LaporanHistoryTable from './Laporanhistorytable.vue'
import LaporanDetailModal from './Laporandetailmodal.vue'
import DeleteConfirmModal from './DeleteConfirmModal.vue'

const { logs, loading, fetchExportLogs, deleteExportLog } = useExportLog()

const search = ref('')
const scopeFilter = ref('')

onMounted(fetchExportLogs)

const filteredLogs = computed(() => {
  let rows = logs.value
  if (scopeFilter.value) {
    rows = rows.filter((log) => log.scope === scopeFilter.value)
  }
  if (search.value.trim()) {
    const term = search.value.trim().toLowerCase()
    rows = rows.filter((log) => (log.device_names || []).some((name) => name.toLowerCase().includes(term)))
  }
  return rows
})

const showDetail = ref(false)
const activeLog = ref(null)

function openDetail(log) {
  activeLog.value = log
  showDetail.value = true
}

const showDeleteConfirm = ref(false)
const logToDelete = ref(null)
const deleting = ref(false)

function askDelete(log) {
  logToDelete.value = log
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!logToDelete.value) return
  deleting.value = true
  try {
    await deleteExportLog(logToDelete.value.id)
    showDeleteConfirm.value = false
    logToDelete.value = null
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
      <h2 class="text-lg font-semibold text-[#0F172A]">Laporan Export Perangkat Listrik</h2>
      <p class="mt-0.5 text-sm text-[#64748B]">Riwayat setiap export PDF dari Manajemen Data — baik satu perangkat maupun semua perangkat.</p>
    </div>

    <div class="mt-5">
      <LaporanToolbar
        :search="search"
        :scope="scopeFilter"
        @update:search="search = $event"
        @update:scope="scopeFilter = $event"
      />
    </div>

    <div class="mt-4">
      <LaporanHistoryTable :logs="filteredLogs" :loading="loading" @view="openDetail" @delete="askDelete" />
    </div>

    <LaporanDetailModal :show="showDetail" :log="activeLog" @close="showDetail = false" />

    <DeleteConfirmModal
      :show="showDeleteConfirm"
      title="Hapus Riwayat Export?"
      :message="`File ${logToDelete?.file_name || ''} akan dihapus permanen dari riwayat.`"
      :loading="deleting"
      @confirm="confirmDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>