<script setup>
import { ref } from 'vue'
import { Zap, Droplet, Settings2, BookOpen } from 'lucide-vue-next'
import PerangkatListrikTab from './datamanage/PerangkatListrikTab.vue'

const activeTab = ref('perangkat')

const tabs = [
  { key: 'perangkat', label: 'Perangkat Listrik', icon: Zap },
  { key: 'air', label: 'Aktivitas Air', icon: Droplet },
  { key: 'tarif', label: 'Tarif & Parameter', icon: Settings2 },
  { key: 'referensi', label: 'Referensi', icon: BookOpen },
]
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[#0F172A]">Manajemen Data</h1>
      <p class="mt-1 text-sm text-[#64748B]">
        Kelola master data yang digunakan <span class="font-semibold text-[#16A34A]">HEMATria</span> untuk perhitungan dan analisis.
      </p>
    </div>

    <div class="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1.5">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        @click="activeTab = tab.key"
        class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        :class="activeTab === tab.key ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'text-[#64748B] hover:text-[#0F172A]'"
      >
        <component :is="tab.icon" class="h-4 w-4" />
        {{ tab.label }}
      </button>
    </div>

    <div class="mt-5">
      <PerangkatListrikTab v-if="activeTab === 'perangkat'" />
      <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-[#64748B]">
        Tab ini belum diimplementasikan.
      </div>
    </div>
  </div>
</template>