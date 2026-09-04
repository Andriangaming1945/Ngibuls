<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { TrendingDown, Wallet, Save, Loader2, CheckCircle2 } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'
import { useDeviceCatalog } from '@/composables/useDeviceCatalog'
import { deviceMonthlyKwh, activityMonthlyLiters, formatRupiah, formatNumber } from '@/composables/energyCalculations'

const props = defineProps({
  // { type: 'device' | 'water', name, monthlyCost, raw } — sumber biaya terbesar
  // gabungan dari perangkat listrik & aktivitas air, dikirim dari SolutionSection.
  contributor: { type: Object, default: null },
  budgetPreference: { type: String, required: true }, // 'none' | 'low' | 'invest'
  tariffElectricity: { type: Number, required: true },
  tariffWater: { type: Number, required: true },
  // Snapshot data lengkap, opsional — dipakai supaya rekomendasi yang disimpan
  // tetap punya konteks data perangkat/air waktu itu, bukan cuma satu kontributor.
  devices: { type: Array, default: () => [] },
  waterActivities: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:budgetPreference'])
const { profile } = useAuth()

// Dipakai buat cek status aktif/nonaktif perangkat sebelum simpan ke DB.
// Reuse composable yang sama dengan admin, bukan bikin query/table baru.
const { catalog, fetchCatalog } = useDeviceCatalog()
onMounted(() => {
  fetchCatalog()
})

const preferenceOptions = [
  { value: 'none', label: 'Tanpa Biaya' },
  { value: 'low', label: 'Budget Rendah' },
  { value: 'invest', label: 'Bersedia Investasi' },
]

const isDevice = computed(() => props.contributor?.type === 'device')

// Cari status perangkat di master data berdasarkan nama. Kalau perangkatnya
// gak ketemu di catalog (misal belum sempat ke-load), default-nya dianggap
// aktif supaya gak nge-block simpan tanpa alasan yang jelas ke user.
const matchedDevice = computed(() => {
  if (!isDevice.value || !props.contributor) return null
  return catalog.value.find((d) => d.name === props.contributor.name) || null
})

const isDeviceActive = computed(() => {
  if (!isDevice.value) return true // water activities: gak ada konsep status, selalu dianggap boleh disimpan
  if (!matchedDevice.value) return true
  return matchedDevice.value.status === 'active'
})

const currentValue = computed(() => {
  if (!props.contributor) return 0
  return isDevice.value ? props.contributor.raw.hoursPerDay : props.contributor.raw.minutes
})

const suggestedValue = computed(() => Math.max(0, Math.round(currentValue.value * 0.75)))

const potentialSavingAmount = computed(() => {
  if (!props.contributor) return 0
  return isDevice.value
    ? deviceMonthlyKwh(props.contributor.raw) * 0.25
    : activityMonthlyLiters(props.contributor.raw) * 0.25
})

const potentialSavingCost = computed(() => {
  if (!props.contributor) return 0
  return isDevice.value
    ? potentialSavingAmount.value * props.tariffElectricity
    : (potentialSavingAmount.value / 1000) * props.tariffWater
})

const budgetTips = computed(() => {
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
  return tipsByPreference[props.budgetPreference] || tipsByPreference.none
})

/* ---------------------------------------------------------------------- */
/* Simpan rekomendasi                                                       */
/* ---------------------------------------------------------------------- */

const saving = ref(false)
const saved = ref(false)
const saveError = ref('')
// true kalau rekomendasi ditampilkan tapi TIDAK masuk ke database karena
// perangkatnya sedang nonaktif di master data (biar storage gak numpuk).
const savedButSkippedDb = ref(false)

// Kalau kontributor berubah (analisis ulang / data baru), reset status "tersimpan"
// biar tombol Simpan aktif lagi buat hasil yang baru.
watch(
  () => props.contributor,
  () => {
    saved.value = false
    savedButSkippedDb.value = false
    saveError.value = ''
  }
)

async function saveRecommendation() {
  if (!props.contributor) return
  if (!profile.value?.id) {
    saveError.value = 'Kamu harus login dulu buat menyimpan rekomendasi.'
    return
  }

  saving.value = true
  saveError.value = ''
  savedButSkippedDb.value = false

  // Perangkat nonaktif di master data → rekomendasi tetap dihitung & tampil
  // di layar (computed di atas jalan seperti biasa), tapi TIDAK di-insert
  // ke saved_recommendations supaya gak menuhin storage buat perangkat
  // yang udah di-nonaktifkan admin.
  if (isDevice.value && !isDeviceActive.value) {
    saving.value = false
    savedButSkippedDb.value = true
    saved.value = true
    return
  }

  const payload = {
    profile_id: profile.value.id,
    contributor_type: props.contributor.type,
    contributor_name: props.contributor.name,
    current_value: currentValue.value,
    suggested_value: suggestedValue.value,
    potential_saving_amount: potentialSavingAmount.value,
    potential_saving_cost: potentialSavingCost.value,
    budget_preference: props.budgetPreference,
    devices_snapshot: props.devices,
    water_activities_snapshot: props.waterActivities,
  }

  const { error } = await supabase.from('saved_recommendations').insert(payload)
  saving.value = false

  if (error) {
    saveError.value = 'Gagal menyimpan rekomendasi. Coba lagi ya.'
    return
  }
  saved.value = true
}
</script>

<template>
  <div class="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
    <div class="flex items-start justify-between gap-3">
      <h3 class="text-lg font-semibold text-[#0F172A]">Yang Sebaiknya Kamu Ubah</h3>
      
    </div>
    <p v-if="saveError" class="mt-1.5 text-xs text-red-600">{{ saveError }}</p>
    <p v-if="savedButSkippedDb" class="mt-1.5 text-xs text-amber-600">
      Perangkat ini sedang nonaktif di master data — rekomendasi ditampilkan tapi tidak disimpan ke database.
    </p>

    <div v-if="contributor" class="mt-4 rounded-xl border border-[#4CAF50]/20 bg-[#4CAF50]/[0.04] p-4">
      <p class="text-sm text-[#0F172A]">
        <span class="font-semibold">{{ contributor.name }}</span> adalah sumber
        {{ isDevice ? 'konsumsi listrik' : 'penggunaan air' }} terbesar kamu.
      </p>
      <p class="mt-1 text-sm text-[#64748B]">
        <template v-if="isDevice">
          Pertimbangkan mengurangi penggunaan dari {{ currentValue }} jam menjadi
          {{ suggestedValue }} jam per hari.
        </template>
        <template v-else>
          Pertimbangkan mengurangi durasi dari {{ currentValue }} menit menjadi
          {{ suggestedValue }} menit.
        </template>
      </p>

      <div class="mt-3 flex flex-wrap gap-4 text-sm">
        <div class="flex items-center gap-1.5 text-[#43A047]">
          <TrendingDown class="h-4 w-4" />
          Potential Saving: ≈ {{ formatNumber(potentialSavingAmount) }}
          {{ isDevice ? 'kWh/bulan' : 'liter/bulan' }}
        </div>
        <div class="flex items-center gap-1.5 text-[#43A047]">
          <Wallet class="h-4 w-4" />
          Estimasi Hemat: ≈ {{ formatRupiah(potentialSavingCost) }}/bulan
        </div>
      </div>
    </div>

    <!-- Preferensi Penghematan -->
    <div class="mt-6">
      <p class="text-sm font-medium text-[#0F172A]">Preferensi Penghematan</p>
      <div class="mt-2 inline-flex flex-wrap gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">
        <button
          v-for="opt in preferenceOptions"
          :key="opt.value"
          type="button"
          @click="emit('update:budgetPreference', opt.value)"
          class="rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200"
          :class="budgetPreference === opt.value ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Recommendation cards -->
    <div class="mt-5 space-y-3">
      <div class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <span class="mt-0.5 text-lg">🔴</span>
        <div>
          <p class="text-sm font-semibold text-[#0F172A]">Prioritas Tinggi</p>
          <p class="mt-0.5 text-sm text-[#64748B]">
            {{ contributor
              ? `Kurangi ${isDevice ? 'jam pemakaian' : 'durasi'} ${contributor.name} — dampaknya paling besar terhadap tagihan kamu.`
              : 'Tambahkan perangkat atau aktivitas air untuk melihat rekomendasi prioritas tinggi.' }}
          </p>
        </div>
      </div>

      <div class="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <span class="mt-0.5 text-lg">🟡</span>
        <div>
          <p class="text-sm font-semibold text-[#0F172A]">Prioritas Sedang</p>
          <p class="mt-0.5 text-sm text-[#64748B]">{{ budgetTips[1] || budgetTips[0] }}</p>
        </div>
      </div>

      <div class="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
        <span class="mt-0.5 text-lg">🟢</span>
        <div>
          <p class="text-sm font-semibold text-[#0F172A]">Mudah Dilakukan</p>
          <p class="mt-0.5 text-sm text-[#64748B]">{{ budgetTips[0] }}</p>
        </div>
      </div>
    </div>
  </div>
</template>