import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { getCategoryForDevice } from '@/utils/deviceCategoryMap'

export function useDeviceCatalog() {
  const catalog = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  async function fetchCatalog() {
    loading.value = true
    error.value = ''
    try {
      const { data, error: err } = await supabase
        .from('devices')
        .select('id, name, watt, quantity, profile_id, updated_at, category, unit, status')

      if (err) throw err

      const groups = new Map()
      for (const row of data || []) {
        const key = row.name.trim().toLowerCase()
        if (!groups.has(key)) {
          groups.set(key, {
            name: row.name,
            category: row.category || getCategoryForDevice(row.name),
            unit: row.unit || 'unit',
            status: row.status || 'active',
            totalWatt: 0,
            unitCount: 0,
            userIds: new Set(),
            lastUpdated: row.updated_at,
          })
        }
        const g = groups.get(key)
        const qty = Number(row.quantity || 1)
        const watt = Number(row.watt || 0)
        g.totalWatt += watt * qty
        g.unitCount += qty
        if (row.profile_id) g.userIds.add(row.profile_id)
        if (row.updated_at && (!g.lastUpdated || new Date(row.updated_at) > new Date(g.lastUpdated))) {
          g.lastUpdated = row.updated_at
        }
      }

      catalog.value = Array.from(groups.values())
        .map((g) => ({
          id: g.name,
          name: g.name,
          category: g.category,
          unit: g.unit,
          status: g.status,
          watt: g.unitCount > 0 ? Math.round(g.totalWatt / g.unitCount) : 0,
          unit_count: g.unitCount,
          user_count: g.userIds.size,
          updated_at: g.lastUpdated,
        }))
        .sort((a, b) => b.user_count - a.user_count)
    } catch (err) {
      error.value = err.message || 'Gagal memuat data perangkat.'
    } finally {
      loading.value = false
    }
  }

  async function fetchDeviceDetail(name) {
    const { data, error: err } = await supabase
      .from('devices')
      .select('id, name, watt, hours_per_day, days_per_month, quantity, updated_at, profile_id, profiles(name)')
      .ilike('name', name)
      .order('updated_at', { ascending: false })
    if (err) throw err
    return data || []
  }

  async function updateDevice(name, payload) {
    saving.value = true
    error.value = ''
    try {
      const { error: err } = await supabase.from('devices').update(payload).ilike('name', name)
      if (err) throw err
      await fetchCatalog()
    } catch (err) {
      error.value = err.message || 'Gagal memperbarui data perangkat.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function deleteDevice(name) {
    error.value = ''
    try {
      const { error: err } = await supabase.from('devices').delete().ilike('name', name)
      if (err) throw err
      catalog.value = catalog.value.filter((d) => d.name !== name)
    } catch (err) {
      error.value = err.message || 'Gagal menghapus data perangkat.'
      throw err
    }
  }

  return {
    catalog,
    loading,
    saving,
    error,
    fetchCatalog,
    fetchDeviceDetail,
    updateDevice,
    deleteDevice,
  }
}