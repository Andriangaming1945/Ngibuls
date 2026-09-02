<script setup>
import { ref } from 'vue'
import { Camera, PencilLine, UploadCloud, Loader2, CheckCircle2, ChevronDown, Plus, Zap, X } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({
  devices: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['device-added', 'remove-device'])
const { profile } = useAuth()

const mode = ref('manual')
const submitting = ref(false)

function emptyForm() {
  return {
    name: '',
    watt: '',
    hoursPerDay: '',
    daysPerMonth: '30',
    quantity: '1',
    model: '',
    voltage: '',
    current: '',
    frequency: '',
  }
}

const manualForm = ref(emptyForm())
const manualAdvancedOpen = ref(false)
const manualError = ref('')

function validateForm(form) {
  if (!form.name.trim()) return 'Nama benda wajib diisi.'
  if (!form.watt || Number(form.watt) <= 0) return 'Isi dulu daya perangkatnya (watt).'
  if (!form.hoursPerDay || Number(form.hoursPerDay) <= 0) return 'Isi dulu berapa jam pemakaiannya per hari.'
  if (Number(form.hoursPerDay) > 24) return 'Pemakaian per hari nggak bisa lebih dari 24 jam.'
  if (!form.daysPerMonth || Number(form.daysPerMonth) < 1 || Number(form.daysPerMonth) > 31)
    return 'Isi jumlah hari pemakaian antara 1–31 hari.'
  if (!form.quantity || Number(form.quantity) < 1) return 'Jumlah unit minimal 1.'
  return ''
}

function buildPayload(form, source) {
  return {
    profile_id: profile.value?.id || null,
    name: form.name.trim(),
    watt: Number(form.watt),
    hours_per_day: Number(form.hoursPerDay),
    days_per_month: Number(form.daysPerMonth),
    quantity: parseInt(form.quantity, 10),
    model: form.model?.trim() || null,
    voltage: form.voltage ? Number(form.voltage) : null,
    current: form.current ? Number(form.current) : null,
    frequency: form.frequency ? Number(form.frequency) : null,
    source,
  }
}

async function insertDevice(payload, errorRef) {
  if (!profile.value?.id) {
    return { id: crypto.randomUUID(), ...payload, created_at: new Date().toISOString() }
  }
  submitting.value = true
  const { data, error } = await supabase.from('devices').insert(payload).select().single()
  submitting.value = false
  if (error) {
    errorRef.value = 'Gagal nyimpen perangkat. Coba lagi ya.'
    return null
  }
  return data
}

async function submitManual() {
  const err = validateForm(manualForm.value)
  if (err) {
    manualError.value = err
    return
  }
  manualError.value = ''
  const payload = buildPayload(manualForm.value, 'manual')
  const saved = await insertDevice(payload, manualError)
  if (!saved) return
  emit('device-added', saved)
  manualForm.value = emptyForm()
  manualAdvancedOpen.value = false
}

const previewUrl = ref('')
const scanStatus = ref('idle')
const scanForm = ref(null)
const scanAdvancedOpen = ref(false)
const scanError = ref('')
const fileInput = ref(null)

function pickPhoto() {
  fileInput.value?.click()
}

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    scanError.value = 'Ukuran foto maksimal 5 MB'
    return
  }

  scanError.value = ''
  previewUrl.value = URL.createObjectURL(file)
  scanStatus.value = 'reading'
  scanForm.value = null

  try {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('eng')
    const { data } = await worker.recognize(file)
    await worker.terminate()

    const text = data.text || ''
    const wattMatch = text.match(/(\d{2,5})\s?W\b/i)
    const voltMatch = text.match(/(\d{2,4})\s?V\b/i)
    const ampMatch = text.match(/(\d+(?:[.,]\d+)?)\s?A\b/i)
    const hzMatch = text.match(/(\d{2,3})\s?Hz\b/i)
    const modelMatch = text.match(/model[:\s]*([A-Za-z0-9\-]+)/i)

    scanForm.value = {
      ...emptyForm(),
      name: modelMatch ? modelMatch[1] : '',
      watt: wattMatch ? String(wattMatch[1]) : '',
      model: modelMatch ? modelMatch[1] : '',
      voltage: voltMatch ? String(voltMatch[1]) : '',
      current: ampMatch ? String(ampMatch[1].replace(',', '.')) : '',
      frequency: hzMatch ? String(hzMatch[1]) : '',
    }
    scanStatus.value = 'done'
  } catch (err) {
    scanStatus.value = 'error'
    scanError.value = 'Fotonya belum bisa dibaca. Coba foto ulang yang lebih jelas, atau isi manual aja.'
  }
}

async function submitScan() {
  const err = validateForm(scanForm.value)
  if (err) {
    scanError.value = err
    return
  }
  scanError.value = ''
  const payload = buildPayload(scanForm.value, 'scan')
  const saved = await insertDevice(payload, scanError)
  if (!saved) return
  emit('device-added', saved)
  resetScan()
}

function resetScan() {
  previewUrl.value = ''
  scanStatus.value = 'idle'
  scanForm.value = null
  scanError.value = ''
  scanAdvancedOpen.value = false
  if (fileInput.value) fileInput.value.value = ''
}

function removeDevice(id) {
  emit('remove-device', id)
}
</script>

<template>
  <div class="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
    <h3 class="text-lg font-semibold text-[#0F172A]">Bagaimana kamu ingin menambahkan perangkat?</h3>

    <div class="mt-4 inline-flex rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">
      <button
        type="button"
        @click="mode = 'scan'"
        class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
        :class="mode === 'scan' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'"
      >
        <Camera class="h-4 w-4" />
        Scan Perangkat
      </button>
      <button
        type="button"
        @click="mode = 'manual'"
        class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
        :class="mode === 'manual' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'"
      >
        <PencilLine class="h-4 w-4" />
        Input Manual
      </button>
    </div>

    <div v-if="mode === 'scan'" class="mt-5">
      <p class="text-sm font-medium text-[#0F172A]">Foto label perangkatmu</p>
      <p class="mt-1 text-sm text-[#64748B]">
        Ngibuls akan coba baca informasi yang ada di label perangkat.
      </p>

      <input ref="fileInput" type="file" accept="image/jpeg,image/png" class="hidden" @change="handleFileChange" />

      <div
        v-if="!previewUrl"
        class="mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-10 text-center"
      >
        <UploadCloud class="h-8 w-8 text-[#64748B]" />
        <p class="text-sm font-medium text-[#0F172A]">Unggah Foto Perangkat</p>
        <p class="text-xs text-[#64748B]">JPG atau PNG, maksimal 5 MB</p>
        <button
          type="button"
          @click="pickPhoto"
          class="mt-1 rounded-lg bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#43A047]"
        >
          Pilih Foto
        </button>
      </div>

      <div v-else class="mt-4 overflow-hidden rounded-xl border border-[#E2E8F0]">
        <img :src="previewUrl" alt="Preview label perangkat" class="max-h-56 w-full bg-[#F8FAFC] object-contain" />

        <div class="border-t border-[#E2E8F0] p-4">
          <div v-if="scanStatus === 'reading'" class="flex items-center gap-2 text-sm text-[#64748B]">
            <Loader2 class="h-4 w-4 animate-spin" />
            Sedang membaca label...
          </div>

          <div v-else-if="scanStatus === 'error'" class="text-sm text-red-600">
            {{ scanError }}
            <button type="button" class="ml-2 font-medium underline" @click="resetScan">Coba lagi</button>
          </div>

          <form v-else-if="scanStatus === 'done' && scanForm" class="space-y-4" @submit.prevent="submitScan">
            <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#4CAF50]">
              <CheckCircle2 class="h-4 w-4" />
              Ini hasil bacanya — cek dan betulkan kalau ada yang salah
            </div>

            <div>
              <label class="text-sm font-medium text-[#0F172A]">Nama Perangkat</label>
              <div
                class="mt-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 focus-within:border-[#4CAF50] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#4CAF50]/15"
              >
                <span
                  v-for="d in devices"
                  :key="d.id"
                  class="flex shrink-0 items-center gap-1.5 rounded-full border border-[#4CAF50]/20 bg-[#E8F5E9] py-1 pl-2.5 pr-1.5 text-sm text-[#0F172A]"
                >
                  <Zap class="h-3 w-3 shrink-0 text-[#F59E0B]" />
                  <span class="font-medium">{{ d.name }}</span>
                  <span class="text-xs text-[#64748B]">{{ d.watt }}W · {{ d.hoursPerDay }}j/hari</span>
                  <button
                    type="button"
                    @click="removeDevice(d.id)"
                    class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
                    aria-label="Hapus perangkat"
                  >
                    <X class="h-2.5 w-2.5" />
                  </button>
                </span>
                <input
                  v-model="scanForm.name"
                  type="text"
                  placeholder="Contoh: AC, Rice Cooker, Laptop"
                  class="min-w-[140px] flex-1 border-0 p-0 text-sm text-[#0F172A] outline-none focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-[#0F172A]">Daya (Watt)</label>
              <p class="text-xs text-[#64748B]">Biasanya tertulis di stiker belakang perangkat.</p>
              <input
                v-model="scanForm.watt"
                type="number"
                placeholder="Contoh: 600"
                class="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label class="text-sm font-medium text-[#0F172A]">Lama Pemakaian</label>
                <p class="text-xs text-[#64748B]">Berapa jam sehari?</p>
                <input
                  v-model="scanForm.hoursPerDay"
                  type="number"
                  step="0.5"
                  placeholder="Contoh: 8"
                  class="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-[#0F172A]">Hari Pemakaian</label>
                <p class="text-xs text-[#64748B]">Berapa hari sebulan?</p>
                <input
                  v-model="scanForm.daysPerMonth"
                  type="number"
                  class="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-[#0F172A]">Jumlah</label>
                <p class="text-xs text-[#64748B]">Ada berapa unit?</p>
                <input
                  v-model="scanForm.quantity"
                  type="number"
                  min="1"
                  class="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
                />
              </div>
            </div>

            <div class="rounded-lg border border-[#E2E8F0]">
              <button
                type="button"
                @click="scanAdvancedOpen = !scanAdvancedOpen"
                class="flex w-full items-center justify-between px-3.5 py-2.5 text-sm font-medium text-[#0F172A]"
              >
                Spesifikasi Tambahan <span class="font-normal text-[#64748B]">(opsional)</span>
                <ChevronDown class="h-4 w-4 text-[#64748B] transition-transform duration-200" :class="scanAdvancedOpen && 'rotate-180'" />
              </button>
              <div v-if="scanAdvancedOpen" class="grid grid-cols-2 gap-3 border-t border-[#E2E8F0] p-3.5">
                <div>
                  <label class="text-xs text-[#64748B]">Model / Tipe</label>
                  <input v-model="scanForm.model" type="text" class="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none" />
                </div>
                <div>
                  <label class="text-xs text-[#64748B]">Tegangan Listrik (Volt)</label>
                  <input v-model="scanForm.voltage" type="number" class="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none" />
                </div>
                <div>
                  <label class="text-xs text-[#64748B]">Arus Listrik (Ampere)</label>
                  <input v-model="scanForm.current" type="number" step="0.1" class="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none" />
                </div>
                <div>
                  <label class="text-xs text-[#64748B]">Frekuensi Listrik (Hz)</label>
                  <input v-model="scanForm.frequency" type="number" class="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none" />
                </div>
              </div>
            </div>

            <p v-if="scanError" class="text-sm text-red-600">{{ scanError }}</p>

            <div class="flex gap-2">
              <button
                type="submit"
                :disabled="submitting"
                class="flex items-center gap-1.5 rounded-lg bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#43A047] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
                <Plus v-else class="h-4 w-4" />
                {{ submitting ? 'Menyimpan...' : 'Tambahkan Perangkat' }}
              </button>
              <button type="button" @click="resetScan" class="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">
                Foto ulang
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <form v-else class="mt-5 space-y-4" @submit.prevent="submitManual">
      <div>
        <label class="text-sm font-medium text-[#0F172A]">Nama Benda</label>
        <div
          class="mt-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 focus-within:border-[#4CAF50] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#4CAF50]/15"
        >
          <span
            v-for="d in devices"
            :key="d.id"
            class="flex shrink-0 items-center gap-1.5 rounded-full border border-[#4CAF50]/20 bg-[#E8F5E9] py-1 pl-2.5 pr-1.5 text-sm text-[#0F172A]"
          >
            <Zap class="h-3 w-3 shrink-0 text-[#F59E0B]" />
            <span class="font-medium">{{ d.name }}</span>
            <span class="text-xs text-[#64748B]">{{ d.watt }}W · {{ d.hoursPerDay }}j/hari</span>
            <button
              type="button"
              @click="removeDevice(d.id)"
              class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
              aria-label="Hapus perangkat"
            >
              <X class="h-2.5 w-2.5" />
            </button>
          </span>
          <input
            v-model="manualForm.name"
            type="text"
            placeholder="Contoh: AC, Rice Cooker, Laptop"
            class="min-w-[140px] flex-1 border-0 p-0 text-sm text-[#0F172A] outline-none focus:ring-0"
          />
        </div>
      </div>

      <div>
        <label class="text-sm font-medium text-[#0F172A]">Daya (Watt)</label>
        <p class="text-xs text-[#64748B]">Biasanya tertulis di stiker belakang perangkat.</p>
        <input
          v-model="manualForm.watt"
          type="number"
          placeholder="Contoh: 600"
          class="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label class="text-sm font-medium text-[#0F172A]">Lama Pemakaian</label>
          <p class="text-xs text-[#64748B]">Berapa jam sehari?</p>
          <input
            v-model="manualForm.hoursPerDay"
            type="number"
            step="0.5"
            placeholder="Contoh: 8"
            class="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-[#0F172A]">Hari Pemakaian</label>
          <p class="text-xs text-[#64748B]">Berapa hari sebulan?</p>
          <input
            v-model="manualForm.daysPerMonth"
            type="number"
            class="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-[#0F172A]">Jumlah</label>
          <p class="text-xs text-[#64748B]">Ada berapa unit?</p>
          <input
            v-model="manualForm.quantity"
            type="number"
            min="1"
            class="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/15"
          />
        </div>
      </div>

      <div class="rounded-lg border border-[#E2E8F0]">
        <button
          type="button"
          @click="manualAdvancedOpen = !manualAdvancedOpen"
          class="flex w-full items-center justify-between px-3.5 py-2.5 text-sm font-medium text-[#0F172A]"
        >
          Spesifikasi Tambahan <span class="font-normal text-[#64748B]">(opsional)</span>
          <ChevronDown class="h-4 w-4 text-[#64748B] transition-transform duration-200" :class="manualAdvancedOpen && 'rotate-180'" />
        </button>
        <div v-if="manualAdvancedOpen" class="grid grid-cols-2 gap-3 border-t border-[#E2E8F0] p-3.5">
          <div>
            <label class="text-xs text-[#64748B]">Model / Tipe</label>
            <input v-model="manualForm.model" type="text" class="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none" />
          </div>
          <div>
            <label class="text-xs text-[#64748B]">Tegangan Listrik (Volt)</label>
            <input v-model="manualForm.voltage" type="number" class="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none" />
          </div>
          <div>
            <label class="text-xs text-[#64748B]">Arus Listrik (Ampere)</label>
            <input v-model="manualForm.current" type="number" step="0.1" class="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none" />
          </div>
          <div>
            <label class="text-xs text-[#64748B]">Frekuensi Listrik (Hz)</label>
            <input v-model="manualForm.frequency" type="number" class="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#4CAF50] focus:outline-none" />
          </div>
        </div>
      </div>

      <p v-if="manualError" class="text-sm text-red-600">{{ manualError }}</p>

      <button
        type="submit"
        :disabled="submitting"
        class="flex items-center gap-1.5 rounded-lg bg-[#4CAF50] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#43A047] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
        <Plus v-else class="h-4 w-4" />
        {{ submitting ? 'Menyimpan...' : 'Tambahkan Perangkat' }}
      </button>
    </form>
  </div>
</template>