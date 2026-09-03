<script setup>
import { X, Loader2 } from 'lucide-vue-next'

defineProps({
  show: { type: Boolean, required: true },
  mode: { type: String, required: true },
  form: { type: Object, required: true },
  categoryOptions: { type: Array, required: true },
  error: { type: String, default: '' },
  saving: { type: Boolean, default: false },
})

defineEmits(['close', 'submit'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 px-4" @click.self="$emit('close')">
    <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-[#0F172A]">
          {{ mode === 'create' ? 'Tambah Perangkat' : 'Edit Perangkat' }}
        </h2>
        <button type="button" @click="$emit('close')" class="text-slate-400 hover:text-[#0F172A]">
          <X class="h-5 w-5" />
        </button>
      </div>

      <form class="mt-4 space-y-4" @submit.prevent="$emit('submit')">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Nama Perangkat</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Contoh: AC"
            class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Kategori</label>
          <input
            v-model="form.category"
            list="category-list"
            type="text"
            placeholder="Contoh: Pendingin"
            class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10"
          />
          <datalist id="category-list">
            <option v-for="c in categoryOptions" :key="c" :value="c" />
          </datalist>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Daya Default (Watt)</label>
            <input
              v-model.number="form.defaultWatt"
              type="number"
              min="1"
              class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Satuan</label>
            <input
              v-model="form.unit"
              type="text"
              placeholder="unit"
              class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10"
            />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Status</label>
          <select
            v-model="form.status"
            class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10"
          >
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ error }}</p>

        <div class="flex items-center justify-end gap-3 pt-1">
          <button type="button" @click="$emit('close')" class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-[#64748B] hover:bg-slate-50">
            Batal
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
            {{ mode === 'create' ? 'Tambah' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>