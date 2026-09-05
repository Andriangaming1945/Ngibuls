<script setup>
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useDeviceCategories } from '@/composables/Usedevicecategories.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  item: { type: Object, default: null },
})

defineEmits(['close'])

const { fetchRelatedDevices } = useDeviceCategories()

const relatedItems = ref([])
const loadingRelated = ref(false)

watch(
  () => [props.show, props.item],
  async ([show, item]) => {
    if (show && item && item.used_for === 'Perangkat Listrik') {
      loadingRelated.value = true
      try {
        relatedItems.value = await fetchRelatedDevices(item.name)
      } catch (err) {
        console.error(err)
        relatedItems.value = []
      } finally {
        loadingRelated.value = false
      }
    } else {
      relatedItems.value = []
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div v-if="show && item" class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 class="text-base font-semibold text-[#0F172A]">Detail Kategori</h3>
          <button type="button" @click="$emit('close')" class="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-50">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="space-y-4 px-6 py-5">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Nama Kategori</p>
            <p class="mt-1 text-sm font-medium text-[#0F172A]">{{ item.name }}</p>
          </div>

          <div class="flex gap-8">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Digunakan Untuk</p>
              <p class="mt-1 text-sm text-[#0F172A]">{{ item.used_for }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Jumlah Data</p>
              <p class="mt-1 text-sm text-[#0F172A]">{{ item.data_count }} perangkat</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Status</p>
              <span
                class="mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ item.status === 'active' ? 'Aktif' : 'Nonaktif' }}
              </span>
            </div>
          </div>

          <div v-if="item.description">
            <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Deskripsi</p>
            <p class="mt-1 text-sm text-[#0F172A]">{{ item.description }}</p>
          </div>

          <div v-if="item.used_for === 'Perangkat Listrik'">
            <p class="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Data Terkait</p>
            <p v-if="loadingRelated" class="mt-1 text-sm text-[#64748B]">Memuat...</p>
            <p v-else-if="relatedItems.length === 0" class="mt-1 text-sm text-[#64748B]">
              Belum ada perangkat di kategori ini.
            </p>
            <ul v-else class="mt-1 list-inside list-disc text-sm text-[#0F172A]">
              <li v-for="(name, idx) in relatedItems" :key="idx">{{ name }}</li>
            </ul>
          </div>
        </div>

        <div class="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>