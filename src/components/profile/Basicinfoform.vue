<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useNgibulsData } from '@/composables/Usengibulsdata'
import { Loader2, CheckCircle2, User } from 'lucide-vue-next'

const { profile } = useAuth()
const { updateProfile } = useNgibulsData()

const housingOptions = [
  { value: 'rumah', label: 'Rumah' },
  { value: 'kost', label: 'Kost' },
  { value: 'kontrakan', label: 'Kontrakan' },
  { value: 'apartemen', label: 'Apartemen' },
  { value: 'usaha', label: 'Usaha' },
]

function emptyForm() {
  return {
    name: '',
    housing_type: '',
    occupants: '',
  }
}

const form = ref(emptyForm())
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

function syncFormFromProfile() {
  if (!profile.value) return
  form.value = {
    name: profile.value.name || '',
    housing_type: profile.value.housing_type || '',
    occupants: profile.value.occupants ?? '',
  }
}

watch(profile, syncFormFromProfile, { immediate: true })

async function handleSave() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!form.value.name.trim()) {
    errorMsg.value = 'Nama tidak boleh kosong.'
    return
  }
  if (form.value.occupants !== '' && Number(form.value.occupants) < 1) {
    errorMsg.value = 'Jumlah penghuni minimal 1.'
    return
  }

  const payload = {
    name: form.value.name.trim(),
    housing_type: form.value.housing_type || null,
    occupants: form.value.occupants !== '' ? parseInt(form.value.occupants, 10) : null,
  }

  saving.value = true
  try {
    const updated = await updateProfile(payload)
    profile.value = { ...profile.value, ...updated }
    successMsg.value = 'Profil berhasil disimpan.'
  } catch (e) {
    errorMsg.value = e?.message || 'Gagal menyimpan profil, coba lagi.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="mt-6 space-y-5" @submit.prevent="handleSave">
    <div class="reveal card-light" style="--delay: 140ms">
      <div class="flex items-center gap-2">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4CAF50]/10">
          <User class="h-4 w-4 text-[#4CAF50]" />
        </span>
        <h3 class="text-base font-semibold text-[#0F172A]">Informasi Dasar</h3>
      </div>

      <div class="mt-4 space-y-4">
        <div>
          <label class="text-sm font-medium text-slate-600">Nama</label>
          <input v-model="form.name" type="text" class="field-light mt-1.5" />
        </div>

        <div>
          <label class="text-sm font-medium text-slate-600">Email</label>
          <input
            :value="profile.email"
            type="email"
            disabled
            class="field-light mt-1.5 cursor-not-allowed bg-slate-50 text-slate-400"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="text-sm font-medium text-slate-600">Tipe Hunian</label>
            <select v-model="form.housing_type" class="field-light mt-1.5">
              <option value="">Belum dipilih</option>
              <option v-for="opt in housingOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-slate-600">Jumlah Penghuni</label>
            <input
              v-model="form.occupants"
              type="number"
              min="1"
              placeholder="Contoh: 2"
              class="field-light mt-1.5"
            />
          </div>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
    </Transition>
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <p v-if="successMsg" class="flex items-center gap-1.5 text-sm text-[#4CAF50]">
        <CheckCircle2 class="h-4 w-4" />
        {{ successMsg }}
      </p>
    </Transition>

    <button
      type="submit"
      :disabled="saving"
      class="save-btn flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#43A047] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_18px_-4px_rgba(76,175,80,0.45)] transition-all duration-200 hover:shadow-[0_8px_24px_-4px_rgba(76,175,80,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
      {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
    </button>
  </form>
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

.field-light {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid rgb(203 213 225);
  background: #ffffff;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.field-light::placeholder {
  color: rgb(148 163 184);
}
.field-light:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}
.save-btn:active:not(:disabled) {
  transform: translateY(0);
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
  .save-btn:hover:not(:disabled) {
    transform: none;
  }
}
</style>