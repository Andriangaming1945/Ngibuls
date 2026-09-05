<script setup>
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  show: { type: Boolean, default: false },
  initial: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save'])

const emptyForm = () => ({
  name: '',
  used_for: 'Perangkat Listrik',
  description: '',
  status: 'active',
})

const form = ref(emptyForm())

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.value = props.initial
        ? {
            name: props.initial.name,
            used_for: props.initial.used_for,
            description: props.initial.description,
            status: props.initial.status,
          }
        : emptyForm()
    }
  },
)

function submit() {
  emit('save', { ...form.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div class="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 class="text-base font-semibold text-[#0F172A]">
            {{ initial ? 'Edit Kategori' : 'Tambah Kategori' }}
          </h3>
          <button type="button" @click="$emit('close')" class="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-50">
            <X class="h-4 w-4" />
          </button>
        </div>

        <form id="kategori-form" @submit.prevent="submit" class="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Nama Kategori</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Masukkan nama kategori"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Digunakan Untuk</label>
            <select
              v-model="form.used_for"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
            >
              <option value="Perangkat Listrik">Perangkat Listrik</option>
              <option value="Aktivitas Air">Aktivitas Air</option>
            </select>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Deskripsi</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Masukkan deskripsi"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
            ></textarea>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0F172A]">Status</label>
            <select
              v-model="form.status"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </form>

        <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form="kategori-form"
            class="rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15803D]"
          >
            Simpan Kategori
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>