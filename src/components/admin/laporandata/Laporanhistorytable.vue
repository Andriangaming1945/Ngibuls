<script setup>
import { ref } from 'vue'
import { formatTanggal, scopeLabel } from '@/utils/pdfExportHelpers'
import { buildExportPdf } from '@/utils/Buildexportpdf'
import { downloadExportExcel } from '@/utils/Buildexportexcel'

defineProps({
  logs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['view', 'delete'])

const scopeStyle = {
  single: 'bg-blue-50 text-blue-700',
  selected: 'bg-amber-50 text-amber-700',
  all: 'bg-emerald-50 text-emerald-700',
}

const downloadingId = ref(null)
const downloadingExcelId = ref(null)

function downloadLog(log) {
  downloadingId.value = log.id
  try {
    const pdfName = (log.file_name || 'perangkat-listrik.pdf').replace(/\.(xlsx|pdf)$/i, '.pdf')
    buildExportPdf(log.payload || []).save(pdfName)
  } finally {
    downloadingId.value = null
  }
}

async function downloadLogExcel(log) {
  downloadingExcelId.value = log.id
  try {
    const excelName = (log.file_name || 'perangkat-listrik.pdf').replace(/\.(xlsx|pdf)$/i, '.xlsx')
    await downloadExportExcel(log.payload || [], excelName)
  } finally {
    downloadingExcelId.value = null
  }
}
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200">
    <table class="w-full min-w-[720px] text-left text-sm">
      <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
        <tr>
          <th class="px-4 py-3">Tanggal</th>
          <th class="px-4 py-3">File</th>
          <th class="px-4 py-3">Cakupan</th>
          <th class="px-4 py-3">Perangkat</th>
          <th class="px-4 py-3">Diekspor Oleh</th>
          <th class="px-4 py-3 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-if="loading">
          <td colspan="6" class="px-4 py-6 text-center text-[#64748B]">Memuat riwayat export...</td>
        </tr>
        <tr v-else-if="logs.length === 0">
          <td colspan="6" class="px-4 py-6 text-center text-[#64748B]">Belum ada riwayat export PDF.</td>
        </tr>
        <tr v-for="log in logs" :key="log.id" class="text-[#0F172A]">
          <td class="whitespace-nowrap px-4 py-3">{{ formatTanggal(log.created_at, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</td>
          <td class="px-4 py-3">{{ log.file_name }}</td>
          <td class="px-4 py-3">
            <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="scopeStyle[log.scope] || 'bg-slate-100 text-slate-700'">
              {{ scopeLabel[log.scope] || log.scope }}
            </span>
          </td>
          <td class="px-4 py-3">
            <span class="font-medium">{{ log.device_count }}</span>
            <span class="text-[#64748B]"> — {{ (log.device_names || []).slice(0, 2).join(', ') }}{{ log.device_names?.length > 2 ? `, +${log.device_names.length - 2} lainnya` : '' }}</span>
          </td>
          <td class="px-4 py-3">{{ log.profiles?.name || log.profiles?.email || '-' }}</td>
          <td class="px-4 py-3 text-right">
            <div class="flex justify-end gap-2">
              <button
                type="button"
                @click="$emit('view', log)"
                class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
              >
                Lihat Detail
              </button>
              <button
                type="button"
                :disabled="downloadingExcelId === log.id"
                @click="downloadLogExcel(log)"
                class="rounded-lg border border-[#16A34A] px-3 py-1.5 text-xs font-semibold text-[#16A34A] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ downloadingExcelId === log.id ? 'Menyiapkan...' : 'Unduh Excel' }}
              </button>
              <button
                type="button"
                :disabled="downloadingId === log.id"
                @click="downloadLog(log)"
                class="rounded-lg bg-[#16A34A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ downloadingId === log.id ? 'Menyiapkan...' : 'Unduh PDF' }}
              </button>
              <button
                type="button"
                @click="$emit('delete', log)"
                class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Hapus
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>