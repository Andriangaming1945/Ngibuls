<script setup>
import { ref, watch } from 'vue'
import { Zap } from 'lucide-vue-next'

const props = defineProps({
  draft: { type: Object, required: true },
})
const emit = defineEmits(['device-saved', 'cancel'])

const hoursPerDay = ref(4)
const daysPerMonth = ref(30)

watch(
  () => props.draft,
  () => {
    hoursPerDay.value = 4
    daysPerMonth.value = 30
  }
)

function saveHabit() {
  emit('device-saved', {
    id: crypto.randomUUID(),
    name: props.draft.name,
    watt: props.draft.watt,
    voltage: props.draft.voltage,
    current: props.draft.current,
    hoursPerDay: Number(hoursPerDay.value) || 0,
    daysPerMonth: Number(daysPerMonth.value) || 0,
    category: 'listrik',
  })
}
</script>

<template>
  <div class="rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/[0.04] p-5 sm:p-6">
    <div class="flex items-center gap-2">
      <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B]/15">
        <Zap class="h-4 w-4 text-[#F59E0B]" />
      </span>
      <h3 class="text-base font-semibold text-[#0F172A]">Bagaimana kamu menggunakannya?</h3>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-[#64748B]">
      <p><span class="font-medium text-[#0F172A]">Perangkat:</span> {{ draft.name }}</p>
      <p><span class="font-medium text-[#0F172A]">Daya:</span> {{ draft.watt }} W</p>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label class="text-sm font-medium text-[#0F172A]">Penggunaan (jam/hari)</label>
        <input
          v-model.number="hoursPerDay"
          type="number"
          min="0"
          max="24"
          class="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/15"
        />
      </div>
      <div>
        <label class="text-sm font-medium text-[#0F172A]">Hari penggunaan (hari/bulan)</label>
        <input
          v-model.number="daysPerMonth"
          type="number"
          min="0"
          max="31"
          class="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/15"
        />
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      <button
        type="button"
        @click="saveHabit"
        class="rounded-lg bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#15803D]"
      >
        Simpan Kebiasaan
      </button>
      <button
        type="button"
        @click="emit('cancel')"
        class="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]"
      >
        Batal
      </button>
    </div>
  </div>
</template>