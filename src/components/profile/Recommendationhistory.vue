<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/lib/supabase'
import { Loader2, History, Zap, Droplet, TrendingDown, Wallet, Trash2, ChevronDown } from 'lucide-vue-next'

const { profile } = useAuth()

const savedRecommendations = ref([])
const loadingRecommendations = ref(true)
const deletingId = ref(null)
const expandedId = ref(null)

async function loadSavedRecommendations() {
  if (!profile.value?.id) {
    loadingRecommendations.value = false
    return
  }
  loadingRecommendations.value = true
  const { data, error } = await supabase
    .from('saved_recommendations')
    .select('*')
    .eq('profile_id', profile.value.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!error && data) {
    savedRecommendations.value = data
  }
  loadingRecommendations.value = false
}

async function deleteSavedRecommendation(id) {
  deletingId.value = id
  const { error } = await supabase.from('saved_recommendations').delete().eq('id', id)
  if (!error) {
    savedRecommendations.value = savedRecommendations.value.filter((r) => r.id !== id)
    if (expandedId.value === id) expandedId.value = null
  }
  deletingId.value = null
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatRupiah(n) {
  return 'Rp' + Math.round(n || 0).toLocaleString('id-ID')
}

function formatNumber(n) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(n || 0)
}

// Sama persis dengan tipsByPreference di RecommendationCard.vue, dipakai ulang di sini
// supaya tips yang muncul saat detail riwayat dibuka konsisten dengan yang tampil waktu analisis.
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
function getTips(pref) {
  return tipsByPreference[pref] || tipsByPreference.none
}

const budgetPreferenceLabels = {
  none: 'Tanpa Biaya',
  low: 'Budget Rendah',
  invest: 'Bersedia Investasi',
}

onMounted(loadSavedRecommendations)
watch(profile, (p) => {
  if (p?.id) loadSavedRecommendations()
})
</script>

<template>
  <div class="reveal card-light mt-6" style="--delay: 320ms">
    <div class="flex items-center gap-2">
      <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4CAF50]/10">
        <History class="h-4 w-4 text-[#4CAF50]" />
      </span>
      <h3 class="text-base font-semibold text-[#0F172A]">Riwayat Rekomendasi Tersimpan</h3>
    </div>

    <div v-if="loadingRecommendations" class="mt-4 flex items-center gap-2 text-sm text-slate-400">
      <Loader2 class="h-4 w-4 animate-spin" />
      Memuat riwayat...
    </div>

    <div v-else-if="!savedRecommendations.length" class="mt-4 rounded-xl border border-dashed border-slate-200 p-5 text-center">
      <p class="text-sm text-slate-500">Belum ada rekomendasi yang disimpan.</p>
      <p class="mt-1 text-xs text-slate-400">
        Klik "Analisis Penggunaan Saya" di halaman Analisis biar riwayatnya muncul di sini.
      </p>
    </div>

    <ul v-else class="mt-4 divide-y divide-slate-100">
      <li v-for="rec in savedRecommendations" :key="rec.id" class="py-3">
        <!-- Header baris: klik buat expand/collapse detail -->
        <button
          type="button"
          class="flex w-full items-start justify-between gap-3 text-left"
          @click="toggleExpand(rec.id)"
          :aria-expanded="expandedId === rec.id"
        >
          <div class="flex min-w-0 items-start gap-3">
            <span
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              :class="rec.contributor_type === 'device' ? 'bg-[#F59E0B]/15' : 'bg-[#0EA5E9]/15'"
            >
              <Zap v-if="rec.contributor_type === 'device'" class="h-4 w-4 text-[#F59E0B]" />
              <Droplet v-else class="h-4 w-4 text-[#0EA5E9]" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-[#0F172A]">{{ rec.contributor_name }}</p>
              <div class="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span class="flex items-center gap-1 text-[#4CAF50]">
                  <TrendingDown class="h-3 w-3" />
                  {{ rec.current_value }} → {{ rec.suggested_value }}
                </span>
                <span class="flex items-center gap-1 text-[#4CAF50]">
                  <Wallet class="h-3 w-3" />
                  {{ formatRupiah(rec.potential_saving_cost) }}/bulan
                </span>
                <span>{{ formatDate(rec.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <ChevronDown
              class="h-4 w-4 text-slate-400 transition-transform duration-200"
              :class="expandedId === rec.id && 'rotate-180'"
            />
            <span
              role="button"
              tabindex="0"
              @click.stop="deleteSavedRecommendation(rec.id)"
              @keydown.enter.stop="deleteSavedRecommendation(rec.id)"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
              aria-label="Hapus riwayat"
            >
              <Loader2 v-if="deletingId === rec.id" class="h-3.5 w-3.5 animate-spin" />
              <Trash2 v-else class="h-3.5 w-3.5" />
            </span>
          </div>
        </button>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-if="expandedId === rec.id"
            class="mt-4 space-y-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4"
          >
            <div class="grid grid-cols-3 gap-3">
              <div class="rounded-lg border border-slate-200 bg-white p-3 text-center">
                <p class="text-[11px] text-slate-400">Listrik</p>
                <p class="mt-0.5 text-sm font-bold text-[#0F172A]">{{ formatNumber(rec.total_kwh) }} kWh</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-3 text-center">
                <p class="text-[11px] text-slate-400">Air</p>
                <p class="mt-0.5 text-sm font-bold text-[#0F172A]">{{ formatNumber(rec.total_liters) }} L</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-3 text-center">
                <p class="text-[11px] text-slate-400">Biaya</p>
                <p class="mt-0.5 text-sm font-bold text-[#0F172A]">{{ formatRupiah(rec.total_cost) }}</p>
              </div>
            </div>

            <div v-if="rec.top_devices?.length">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Top Energy Consumers</p>
              <div class="mt-2 space-y-2.5">
                <div v-for="(d, i) in rec.top_devices" :key="d.name + i">
                  <div class="flex items-center justify-between text-xs text-[#0F172A]">
                    <span>{{ String(i + 1).padStart(2, '0') }} — {{ d.name }}</span>
                    <span class="text-slate-500">{{ formatNumber(d.kwh) }} kWh · {{ d.percent }}%</span>
                  </div>
                  <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div class="h-full rounded-full bg-[#F59E0B]" :style="{ width: d.percent + '%' }" />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="rec.top_water_activities?.length">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Top Water Usage</p>
              <div class="mt-2 space-y-2.5">
                <div v-for="(a, i) in rec.top_water_activities" :key="a.name + i">
                  <div class="flex items-center justify-between text-xs text-[#0F172A]">
                    <span>{{ a.name }}</span>
                    <span class="text-slate-500">{{ a.percent }}%</span>
                  </div>
                  <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div class="h-full rounded-full bg-[#0EA5E9]" :style="{ width: a.percent + '%' }" />
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-lg border border-[#4CAF50]/20 bg-[#4CAF50]/[0.05] p-3">
              <p class="text-xs text-[#0F172A]">
                <span class="font-semibold">{{ rec.contributor_name }}</span> adalah sumber
                {{ rec.contributor_type === 'device' ? 'konsumsi listrik' : 'penggunaan air' }} terbesar saat itu.
              </p>
              <p class="mt-1 text-xs text-slate-500">
                Rekomendasi: kurangi dari {{ rec.current_value }} ke {{ rec.suggested_value }}
                {{ rec.contributor_type === 'device' ? 'jam/hari' : 'menit' }}.
              </p>
              <div class="mt-2 flex flex-wrap gap-3 text-xs text-[#43A047]">
                <span class="flex items-center gap-1">
                  <TrendingDown class="h-3 w-3" />
                  ≈ {{ formatNumber(rec.potential_saving_amount) }}
                  {{ rec.contributor_type === 'device' ? 'kWh' : 'liter' }}/bulan
                </span>
                <span class="flex items-center gap-1">
                  <Wallet class="h-3 w-3" />
                  ≈ {{ formatRupiah(rec.potential_saving_cost) }}/bulan
                </span>
              </div>
            </div>

            <div>
              <p class="text-xs font-medium text-slate-500">
                Preferensi saat itu:
                <span class="font-semibold text-[#0F172A]">
                  {{ budgetPreferenceLabels[rec.budget_preference] || 'Tanpa Biaya' }}
                </span>
              </p>
              <ul class="mt-1.5 list-disc space-y-1 pl-4 text-xs text-slate-500">
                <li v-for="(tip, i) in getTips(rec.budget_preference)" :key="i">{{ tip }}</li>
              </ul>
            </div>
          </div>
        </Transition>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.card-light {
  border-radius: 1rem;
  border: 1px solid rgb(226 232 240);
  background: #ffffff;
  padding: 1.25rem;
  box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.04);
}
@media (min-width: 640px) {
  .card-light {
    padding: 1.5rem;
  }
}

.reveal {
  animation: fadeSlideUp 0.5s ease-out both;
  animation-delay: var(--delay, 0ms);
}
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    animation: none;
  }
}
</style>