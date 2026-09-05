<script setup>
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  show: { type: Boolean, default: false },
  initial: { type: Object, default: null },
})
const emit = defineEmits(['close', 'save'])

const emptyForm = () => ({
  contributor_type: 'device',
  contributor_name: '',
  current_value: '',
  suggested_value: '',
  potential_saving_amount: '',
  potential_saving_cost: '',
})

const form = ref(emptyForm())

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.value = props.initial
        ? {
            contributor_type: props.initial.contributor_type,
            contributor_name: props.initial.contributor_name,
            current_value: props.initial.current_value,
            suggested_value: props.initial.suggested_value,
            potential_saving_amount: props.initial.potential_saving_amount,
            potential_saving_cost: props.initial.potential_saving_cost,
          }
        : emptyForm()
    }
  },
)

function submit() {
  emit('save', {
    contributor_type: form.value.contributor_type,
    contributor_name: form.value.contributor_name,
    current_value: Number(form.value.current_value),
    suggested_value: Number(form.value.suggested_value),
    potential_saving_amount: Number(form.value.potential_saving_amount || 0),
    potential_saving_cost: Number(form.value.potential_saving_cost || 0),
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div class="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 class="text-base font-semibold text-[#0F172A]">{{ initial ? 'Edit Rekomendasi' : 'Tambah Rekomendasi' }}</h3>
          <button type="button" @click="$emit('close')" class="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-50"><X class="h-4 w-4" /></button>
        </div>
        <form id="rekomendasi-form" @submit.prevent="submit" class="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Jenis</label>
            <select v-model="form.contributor_type" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20">
              <option value="device">Listrik</option>
              <option value="water">Air</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Nama Perangkat/Aktivitas</label>
            <input v-model="form.contributor_name" type="text" required placeholder="Misal: AC, Laptop, Mandi" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Nilai Saat Ini</label>
              <input v-model="form.current_value" type="number" step="any" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Nilai Disarankan</label>
              <input v-model="form.suggested_value" type="number" step="any" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Potensi Hemat (unit)</label>
              <input v-model="form.potential_saving_amount" type="number" step="any" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Potensi Hemat (Rp)</label>
              <input v-model="form.potential_saving_cost" type="number" step="any" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20" />
            </div>
          </div>
        </form>
        <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button type="button" @click="$emit('close')" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50">Batal</button>
          <button type="submit" form="rekomendasi-form" class="rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15803D]">Simpan</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>