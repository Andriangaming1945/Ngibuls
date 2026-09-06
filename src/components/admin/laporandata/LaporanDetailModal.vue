<script setup>
import { ref } from 'vue'
import { formatRupiah, formatTanggal, budgetPreferenceLabel, priorityListFor, scopeLabel } from '@/utils/Pdfexporthelpers'
import { buildExportPdf } from '@/utils/Buildexportpdf'
import { downloadExportExcel } from '@/utils/Buildexportexcel'

const props = defineProps({
  show: { type: Boolean, default: false },
  log: { type: Object, default: () => null },
})

defineEmits(['close'])

const downloadingExcel = ref(false)

function download() {
  if (!props.log) return
  buildExportPdf(props.log.payload || []).save(props.log.file_name || 'perangkat-listrik.pdf')
}

async function downloadExcel() {
  if (!props.log) return
  downloadingExcel.value = true
  try {
    const excelName = (props.log.file_name || 'perangkat-listrik.pdf').replace(/\.pdf$/i, '.xlsx')
    await downloadExportExcel(props.log.payload || [], excelName)
  } finally {
    downloadingExcel.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show && log" class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div class="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
        <div class="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 class="text-base font-semibold text-[#0F172A]">Detail Export — {{ log.file_name }}</h3>
            <p class="mt-0.5 text-sm text-[#64748B]">
              {{ formatTanggal(log.created_at, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
              · {{ scopeLabel[log.scope] || log.scope }} · {{ log.device_count }} perangkat
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              :disabled="downloadingExcel"
              @click="downloadExcel"
              class="rounded-lg border border-[#16A34A] px-3 py-1.5 text-xs font-semibold text-[#16A34A] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ downloadingExcel ? 'Menyiapkan...' : 'Unduh Excel' }}
            </button>
            <button
              type="button"
              @click="download"
              class="rounded-lg bg-[#16A34A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#15803D]"
            >
              Unduh PDF
            </button>
            <button type="button" @click="$emit('close')" class="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-50">✕</button>
          </div>
        </div>

        <div class="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          <div v-for="device in log.payload" :key="device.id" class="rounded-xl border border-slate-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-[#0F172A]">{{ device.name }}</p>
                <p class="text-xs text-[#64748B]">{{ device.category }} · {{ device.watt }} W · {{ device.unit_count }} {{ device.unit }}</p>
              </div>
              <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="device.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'">
                {{ device.status === 'active' ? 'Aktif' : 'Nonaktif' }}
              </span>
            </div>

            <p v-if="!device.recommendations?.length" class="mt-3 text-sm text-[#94A3B8]">Tidak ada riwayat rekomendasi untuk perangkat ini pada saat export.</p>

            <div v-else class="mt-3 space-y-3">
              <div v-for="(r, i) in device.recommendations" :key="i" class="rounded-lg bg-slate-50 p-3">
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
                  <span class="font-medium text-[#0F172A]">{{ r.user_label }}</span>
                  <span>{{ formatTanggal(r.created_at) }}</span>
                </div>
                <p class="mt-1 text-sm text-[#0F172A]">
                  {{ r.current_value }} → {{ r.suggested_value }}
                  <span class="text-[#64748B]">· Potensi hemat {{ formatRupiah(r.potential_saving_cost) }}/bulan · {{ budgetPreferenceLabel[r.budget_preference] || 'Tanpa Biaya' }}</span>
                </p>

                <ul class="mt-2 space-y-1">
                  <li v-for="p in priorityListFor(r, device.name)" :key="p.level" class="text-xs text-[#334155]">
                    <span class="font-semibold text-[#16A34A]">{{ p.level }}:</span> {{ p.text }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>