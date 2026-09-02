<script setup>
import { ref, computed, onMounted } from 'vue'
import { Droplet, Plus, X, Sparkles, ArrowRight, Wallet, ChevronDown, Loader2 } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'
import {
  deviceMonthlyCost,
  activityMonthlyCost,
  deviceMonthlyKwh,
  activityMonthlyLiters,
  DEFAULT_TARIFF_PER_KWH,
  DEFAULT_TARIFF_PER_M3,
} from '@/composables/energyCalculations'
import DeviceInputCard from './Deviceinputcard.vue'
import AnalysisResultCard from './Analysisresultcard.vue'
import RecommendationCard from './Recommendationcard.vue'
import SimulationCard from './Simulationcard.vue'

const { profile } = useAuth()

const devices = ref([])
const waterActivities = ref([])
const loadingData = ref(true)

// User bisa ketik angka pakai koma (0,5) atau titik (0.5) — dua-duanya harus jalan.
function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0
  const n = Number(String(value).trim().replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function displayOrDash(value) {
  return value ? value : '–'
}

// Mapping row Supabase (snake_case) -> shape yang dipakai di komponen (camelCase),
// biar konsisten sama field yang dipakai devices juga.
function mapWaterRow(row) {
  return {
    id: row.id,
    name: row.name,
    minutes: row.minutes ?? 0,
    timesPerDay: row.times_per_day ?? 0,
    daysPerMonth: row.days_per_month ?? 0,
  }
}

// Devices dari DeviceInputCard sudah datang dalam bentuk row Supabase (snake_case),
// tapi energyCalculations.js pakai camelCase — jadi di-normalisasi di sini.
function mapDeviceRow(row) {
  return {
    id: row.id,
    name: row.name,
    watt: row.watt,
    hoursPerDay: row.hours_per_day,
    daysPerMonth: row.days_per_month,
    quantity: row.quantity,
  }
}

async function loadExistingData() {
  if (!profile.value?.id) {
    loadingData.value = false
    return
  }
  loadingData.value = true
  const [devicesRes, waterRes] = await Promise.all([
    supabase.from('devices').select('*').eq('profile_id', profile.value.id).order('created_at'),
    supabase.from('water_activities').select('*').eq('profile_id', profile.value.id).order('created_at'),
  ])
  if (!devicesRes.error && devicesRes.data) {
    devices.value = devicesRes.data.map(mapDeviceRow)
  }
  if (!waterRes.error && waterRes.data) {
    waterActivities.value = waterRes.data.map(mapWaterRow)
  }
  loadingData.value = false
}

onMounted(loadExistingData)

// Pengaturan Biaya
const billingOpen = ref(false)
const tariffElectricity = ref(DEFAULT_TARIFF_PER_KWH)
const tariffWater = ref(DEFAULT_TARIFF_PER_M3)
const paymentMethodOptions = [
  { value: 'meter-sendiri', label: 'Meter sendiri' },
  { value: 'dibagi', label: 'Dibagi sesuai pemakaian' },
  { value: 'tarif-tetap', label: 'Tarif tetap' },
  { value: 'termasuk-kost', label: 'Sudah termasuk kost' },
]
const paymentMethodElectricity = ref('meter-sendiri')
const paymentMethodWater = ref('meter-sendiri')
const electricityIncluded = computed(() => paymentMethodElectricity.value === 'termasuk-kost')
const waterIncluded = computed(() => paymentMethodWater.value === 'termasuk-kost')

const budgetPreference = ref('none')
const analyzed = ref(false)

// Device sudah tersimpan ke Supabase & sudah dalam bentuk row lewat DeviceInputCard,
// tinggal dinormalisasi ke shape camelCase yang dipakai di card & kalkulasi.
function onDeviceAdded(device) {
  devices.value.push(mapDeviceRow(device))
  analyzed.value = false
}

async function removeDevice(id) {
  devices.value = devices.value.filter((d) => d.id !== id)
  await supabase.from('devices').delete().eq('id', id)
}

const waterActivityOptions = ['Mandi', 'Cuci pakaian', 'Cuci piring', 'Wudhu', 'Membersihkan kamar', 'Aktivitas lainnya']
function emptyWaterForm() {
  return { name: waterActivityOptions[0], minutes: '', timesPerDay: '', daysPerMonth: '30' }
}
const waterForm = ref(emptyWaterForm())
const waterSaving = ref(false)
const waterError = ref('')

// Semua field boleh dikosongin — yang kosong dianggap 0 dan tampil "–" di daftar.
// Disimpan ke tabel water_activities di Supabase, sama seperti devices.
async function addWaterActivity() {
  if (!profile.value?.id) {
    waterError.value = 'Kamu harus login dulu buat nambahin aktivitas air.'
    return
  }
  waterError.value = ''
  waterSaving.value = true

  const payload = {
    profile_id: profile.value.id,
    name: waterForm.value.name,
    minutes: toNumber(waterForm.value.minutes),
    times_per_day: toNumber(waterForm.value.timesPerDay),
    days_per_month: toNumber(waterForm.value.daysPerMonth),
  }

  const { data, error } = await supabase.from('water_activities').insert(payload).select().single()
  waterSaving.value = false

  if (error) {
    waterError.value = 'Gagal nyimpen aktivitas air. Coba lagi ya.'
    return
  }

  waterActivities.value.push(mapWaterRow(data))
  waterForm.value = emptyWaterForm()
  analyzed.value = false
}

async function removeWaterActivity(id) {
  waterActivities.value = waterActivities.value.filter((a) => a.id !== id)
  await supabase.from('water_activities').delete().eq('id', id)
}

const canAnalyze = computed(() => devices.value.length > 0 || waterActivities.value.length > 0)

// Sumber biaya terbesar — dibandingkan lintas listrik & air pakai biaya bulanan,
// bukan cuma dari perangkat listrik saja.
const topContributor = computed(() => {
  const items = [
    ...devices.value.map((d) => ({
      type: 'device',
      name: d.name,
      monthlyCost: deviceMonthlyCost(d, tariffElectricity.value),
      raw: d,
    })),
    ...waterActivities.value.map((a) => ({
      type: 'water',
      name: a.name,
      monthlyCost: activityMonthlyCost(a, tariffWater.value),
      raw: a,
    })),
  ]
  if (!items.length) return null
  return items.sort((a, b) => b.monthlyCost - a.monthlyCost)[0]
})

/* ---------------------------------------------------------------------- */
/* Simpan snapshot analisis ke riwayat (saved_recommendations)              */
/* ---------------------------------------------------------------------- */
// Perhitungan current/suggested/potential saving di bawah ini SAMA PERSIS
// dengan yang dipakai di RecommendationCard.vue, supaya angka yang tersimpan
// sebagai riwayat konsisten dengan yang ditampilkan ke user.

const savingAnalysis = ref(false)
const analysisSaveError = ref('')

// Hitung total & ranking — logic-nya sama persis dengan yang dipakai AnalysisResultCard
// (pakai helper deviceMonthlyKwh/deviceMonthlyCost/activityMonthlyLiters/activityMonthlyCost),
// supaya angka yang tersimpan sebagai riwayat konsisten dengan yang ditampilkan di layar.
function buildAnalysisTotals() {
  const deviceRows = devices.value.map((d) => ({ name: d.name, kwh: deviceMonthlyKwh(d) }))
  const totalKwh = deviceRows.reduce((sum, d) => sum + d.kwh, 0)
  const topDevices = [...deviceRows]
    .sort((a, b) => b.kwh - a.kwh)
    .map((d) => ({
      name: d.name,
      kwh: d.kwh,
      percent: totalKwh > 0 ? Math.round((d.kwh / totalKwh) * 1000) / 10 : 0,
    }))

  const waterRows = waterActivities.value.map((a) => ({ name: a.name, liters: activityMonthlyLiters(a) }))
  const totalLiters = waterRows.reduce((sum, a) => sum + a.liters, 0)
  const topWaterActivities = [...waterRows]
    .sort((a, b) => b.liters - a.liters)
    .map((a) => ({
      name: a.name,
      liters: a.liters,
      percent: totalLiters > 0 ? Math.round((a.liters / totalLiters) * 1000) / 10 : 0,
    }))

  const electricityCost = electricityIncluded.value
    ? 0
    : devices.value.reduce((sum, d) => sum + deviceMonthlyCost(d, tariffElectricity.value), 0)
  const waterCost = waterIncluded.value
    ? 0
    : waterActivities.value.reduce((sum, a) => sum + activityMonthlyCost(a, tariffWater.value), 0)

  return { totalKwh, totalLiters, totalCost: electricityCost + waterCost, topDevices, topWaterActivities }
}

function buildRecommendationPayload(contributor) {
  const isDevice = contributor.type === 'device'
  const currentValue = isDevice ? contributor.raw.hoursPerDay : contributor.raw.minutes
  const suggestedValue = Math.max(0, Math.round(currentValue * 0.75))
  const potentialSavingAmount = isDevice
    ? deviceMonthlyKwh(contributor.raw) * 0.25
    : activityMonthlyLiters(contributor.raw) * 0.25
  const potentialSavingCost = isDevice
    ? potentialSavingAmount * tariffElectricity.value
    : (potentialSavingAmount / 1000) * tariffWater.value

  const totals = buildAnalysisTotals()

  return {
    profile_id: profile.value.id,
    contributor_type: contributor.type,
    contributor_name: contributor.name,
    current_value: currentValue,
    suggested_value: suggestedValue,
    potential_saving_amount: potentialSavingAmount,
    potential_saving_cost: potentialSavingCost,
    budget_preference: budgetPreference.value,
    devices_snapshot: devices.value,
    water_activities_snapshot: waterActivities.value,
    // Snapshot lengkap kartu "Analisis Penggunaanmu" (total & ranking) —
    // supaya histori di halaman Profile bisa nampilin ulang persis kayak yang di layar.
    tariff_electricity: tariffElectricity.value,
    tariff_water: tariffWater.value,
    total_kwh: totals.totalKwh,
    total_liters: totals.totalLiters,
    total_cost: totals.totalCost,
    top_devices: totals.topDevices,
    top_water_activities: totals.topWaterActivities,
  }
}

async function saveAnalysisSnapshot() {
  if (!profile.value?.id || !topContributor.value) return

  savingAnalysis.value = true
  analysisSaveError.value = ''

  const payload = buildRecommendationPayload(topContributor.value)
  const { error } = await supabase.from('saved_recommendations').insert(payload)

  savingAnalysis.value = false
  if (error) {
    analysisSaveError.value = 'Analisis berhasil, tapi gagal disimpan ke riwayat profil. Coba lagi ya.'
  }
}

async function runAnalysis() {
  if (!canAnalyze.value) return
  analyzed.value = true
  await saveAnalysisSnapshot()
}
</script>

<template>
  <section class="bg-[#F8FAFC] px-4 py-20 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-[1280px]">
      <!-- Header -->
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.15em] text-[#4CAF50]">Smart Resource Analysis</p>
        <h2 class="mt-3 text-3xl font-bold text-[#0F172A] sm:text-4xl">
          Masukkan Kebiasaanmu. Temukan Cara Hematmu.
        </h2>
        <p class="mt-4 text-base leading-relaxed text-[#64748B]">
          Tambahkan perangkat yang kamu gunakan atau ceritakan rutinitas harianmu. Ngibuls akan membantu menemukan
          sumber pemborosan dan menentukan langkah penghematan yang paling berdampak.
        </p>
      </div>

      <!-- Step indicator -->
      <div class="mx-auto mt-10 flex max-w-md items-center justify-center gap-4 text-sm font-medium text-[#64748B]">
        <span :class="!analyzed ? 'text-[#4CAF50]' : ''">01 — Tambahkan</span>
        <span class="h-px w-6 bg-[#E2E8F0]" />
        <span :class="canAnalyze && !analyzed ? 'text-[#4CAF50]' : ''">02 — Analisis</span>
        <span class="h-px w-6 bg-[#E2E8F0]" />
        <span :class="analyzed && topContributor ? 'text-[#4CAF50]' : ''">03 — Hemat</span>
      </div>

      <!-- CTA Analisis: sengaja ditaruh di sini (bukan di bawah form panjang) supaya selalu
           kelihatan tanpa perlu scroll dulu, dan dibikin lebih besar + warna hijau (bukan navy)
           biar lebih menonjol sebagai tombol aksi utama. -->
      <div v-if="!loadingData" class="mx-auto mt-8 max-w-xl">
        <button
          type="button"
          @click="runAnalysis"
          :disabled="!canAnalyze || savingAnalysis"
          class="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#16A34A] px-8 py-5 text-base font-bold text-white shadow-[0_10px_30px_-10px_rgba(22,163,74,0.55)] transition-all duration-200 hover:bg-[#15803D] hover:shadow-[0_14px_36px_-8px_rgba(22,163,74,0.65)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <Loader2 v-if="savingAnalysis" class="h-5 w-5 animate-spin" />
          <Sparkles v-else class="h-5 w-5" />
          {{ savingAnalysis ? 'Menyimpan ke riwayat...' : 'Analisis Penggunaan Saya' }}
          <ArrowRight v-if="!savingAnalysis" class="h-5 w-5" />
        </button>
        <p v-if="!canAnalyze" class="mt-2.5 text-center text-xs text-[#64748B]">
          Tambahkan minimal satu perangkat atau aktivitas air dulu.
        </p>
        <p v-else-if="analysisSaveError" class="mt-2.5 text-center text-xs text-red-600">{{ analysisSaveError }}</p>
        <p v-else-if="!analyzed" class="mt-2.5 text-center text-xs text-[#64748B]">
          Estimasi sudah muncul di bawah — klik tombol di atas untuk dapat rekomendasi & simulasi personal.
        </p>
        <p v-else class="mt-2.5 text-center text-xs text-[#4CAF50]">
          Tersimpan ke riwayat profil kamu.
        </p>
      </div>

      <div v-if="loadingData" class="mt-12 flex items-center justify-center gap-2 text-sm text-[#64748B]">
        <Loader2 class="h-4 w-4 animate-spin" />
        Memuat data kamu...
      </div>

      <!-- Main grid -->
      <div v-else class="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- LEFT: input -->
        <div class="space-y-6">
          <DeviceInputCard :devices="devices" @device-added="onDeviceAdded" @remove-device="removeDevice" />

          <!-- Penggunaan Air -->
          <div class="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
            <div class="flex items-center gap-2">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0EA5E9]/15">
                <Droplet class="h-4 w-4 text-[#0EA5E9]" />
              </span>
              <h3 class="text-base font-semibold text-[#0F172A]">Penggunaan Air</h3>
            </div>

            <div class="mt-4 space-y-3">
              <select
                v-model="waterForm.name"
                class="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
              >
                <option v-for="opt in waterActivityOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="text-xs text-[#64748B]">Durasi (menit)</label>
                  <input
                    v-model="waterForm.minutes"
                    type="text"
                    inputmode="decimal"
                    placeholder="10"
                    class="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
                  />
                </div>
                <div>
                  <label class="text-xs text-[#64748B]">Frekuensi (kali/hari)</label>
                  <input
                    v-model="waterForm.timesPerDay"
                    type="text"
                    inputmode="decimal"
                    placeholder="2"
                    class="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
                  />
                </div>
                <div>
                  <label class="text-xs text-[#64748B]">Hari (hari/bulan)</label>
                  <input
                    v-model="waterForm.daysPerMonth"
                    type="text"
                    inputmode="decimal"
                    placeholder="30"
                    class="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
                  />
                </div>
              </div>

              <button
                type="button"
                @click="addWaterActivity"
                :disabled="waterSaving"
                class="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Loader2 v-if="waterSaving" class="h-4 w-4 animate-spin" />
                <Plus v-else class="h-4 w-4" />
                {{ waterSaving ? 'Menyimpan...' : 'Tambah Aktivitas' }}
              </button>
              <p v-if="waterError" class="text-sm text-red-600">{{ waterError }}</p>
            </div>

            <!-- Daftar aktivitas air -> tag input -->
            <div v-if="waterActivities.length" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="a in waterActivities"
                :key="a.id"
                class="flex items-center gap-1.5 rounded-full border border-[#0EA5E9]/20 bg-[#F0F9FF] py-1.5 pl-3 pr-1.5 text-sm text-[#0F172A]"
              >
                <Droplet class="h-3.5 w-3.5 shrink-0 text-[#0EA5E9]" />
                <span class="font-medium">{{ a.name }}</span>
                <span class="text-xs text-[#64748B]">
                  {{ displayOrDash(a.minutes) }}mnt · {{ displayOrDash(a.timesPerDay) }}x/hari
                </span>
                <button
                  type="button"
                  @click="removeWaterActivity(a.id)"
                  class="ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
                  aria-label="Hapus aktivitas"
                >
                  <X class="h-3 w-3" />
                </button>
              </span>
            </div>
          </div>

          <!-- Pengaturan Biaya -->
          <div class="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
          <button type="button" @click="billingOpen = !billingOpen" class="flex w-full items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4CAF50]/15">
                  <Wallet class="h-4 w-4 text-[#4CAF50]" />
                </span>
                <h3 class="text-base font-semibold text-[#0F172A]">Pengaturan Biaya</h3>
              </div>
              <ChevronDown class="h-4 w-4 text-[#64748B] transition-transform duration-200" :class="billingOpen && 'rotate-180'" />
            </button>

            <div v-if="billingOpen" class="mt-4 space-y-5">
              <p class="text-xs text-[#64748B]">
                Tarif dapat disesuaikan dengan sistem pembayaran kost atau tagihan yang kamu gunakan.
              </p>

              <div>
                <label class="text-sm font-medium text-[#0F172A]">Tarif listrik</label>
                <div class="mt-1.5 flex items-center gap-2">
                  <span class="shrink-0 text-sm text-[#64748B]">Rp</span>
                  <input
                    v-model.number="tariffElectricity"
                    type="number"
                    class="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
                  />
                  <span class="shrink-0 text-sm text-[#64748B]">/ kWh</span>
                </div>
                <select
                  v-model="paymentMethodElectricity"
                  class="mt-2 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
                >
                  <option v-for="opt in paymentMethodOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>

              <div>
                <label class="text-sm font-medium text-[#0F172A]">Tarif air</label>
                <div class="mt-1.5 flex items-center gap-2">
                  <span class="shrink-0 text-sm text-[#64748B]">Rp</span>
                  <input
                    v-model.number="tariffWater"
                    type="number"
                    class="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
                  />
                  <span class="shrink-0 text-sm text-[#64748B]">/ m³</span>
                </div>
                <select
                  v-model="paymentMethodWater"
                  class="mt-2 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
                >
                  <option v-for="opt in paymentMethodOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: live summary / hasil -->
        <div class="space-y-6">
          <!-- Live estimation: muncul begitu ada data, tidak perlu tunggu klik analisis -->
          <template v-if="canAnalyze">
            <AnalysisResultCard
              :devices="devices"
              :water-activities="waterActivities"
              :tariff-electricity="tariffElectricity"
              :tariff-water="tariffWater"
              :electricity-included="electricityIncluded"
              :water-included="waterIncluded"
            />
          </template>
          <div v-else class="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white p-8 text-center">
            <Sparkles class="h-8 w-8 text-[#94A3B8]" />
            <p class="mt-3 text-sm font-medium text-[#0F172A]">Estimasi akan muncul di sini</p>
            <p class="mt-1 text-sm text-[#64748B]">Tambahkan perangkat atau aktivitas air untuk mulai lihat estimasinya.</p>
          </div>

          <!-- Rekomendasi & simulasi: baru muncul setelah klik "Analisis Penggunaan Saya" -->
          <template v-if="analyzed && topContributor">
            <RecommendationCard
              :contributor="topContributor"
              :budget-preference="budgetPreference"
              :tariff-electricity="tariffElectricity"
              :tariff-water="tariffWater"
              :devices="devices"
              :water-activities="waterActivities"
              @update:budget-preference="budgetPreference = $event"
            />
            <SimulationCard
              :contributor="topContributor"
              :tariff-electricity="tariffElectricity"
              :tariff-water="tariffWater"
            />
          </template>
        </div>
      </div>
    </div>
  </section>
</template>