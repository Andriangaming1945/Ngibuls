import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useDeviceCategories() {
  const categories = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  async function fetchCategories() {
    loading.value = true
    error.value = ''
    try {
      const [catRes, devRes] = await Promise.all([
        supabase.from('device_categories').select('*').order('created_at', { ascending: false }),
        supabase.from('devices').select('category, profile_id').is('deleted_at', null),
      ])
      if (catRes.error) throw catRes.error
      if (devRes.error) throw devRes.error

      const counts = {}
      for (const d of devRes.data || []) {
        const key = (d.category || '').toLowerCase()
        if (!counts[key]) counts[key] = { data_count: 0, users: new Set() }
        counts[key].data_count += 1
        if (d.profile_id) counts[key].users.add(d.profile_id)
      }

      categories.value = (catRes.data || []).map((c) => {
        const key = c.name.toLowerCase()
        return {
          ...c,
          data_count: counts[key]?.data_count || 0,
          user_count: counts[key]?.users.size || 0,
        }
      })
    } catch (err) {
      error.value = err.message || 'Gagal memuat kategori.'
    } finally {
      loading.value = false
    }
  }

  async function createCategory(payload) {
    saving.value = true
    error.value = ''
    try {
      const { data, error: err } = await supabase
        .from('device_categories')
        .insert([
          {
            name: payload.name,
            used_for: payload.used_for,
            description: payload.description,
            status: payload.status ?? 'active',
          },
        ])
        .select()
      if (err) throw err
      await fetchCategories()
      return data
    } catch (err) {
      error.value = err.message || 'Gagal menambah kategori.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function updateCategory(id, payload) {
    saving.value = true
    error.value = ''
    try {
      const { data, error: err } = await supabase
        .from('device_categories')
        .update({
          name: payload.name,
          used_for: payload.used_for,
          description: payload.description,
          status: payload.status,
        })
        .eq('id', id)
        .select()
      if (err) throw err
      await fetchCategories()
      return data
    } catch (err) {
      error.value = err.message || 'Gagal memperbarui kategori.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function deleteCategory(id) {
    error.value = ''
    try {
      const { error: err } = await supabase.from('device_categories').delete().eq('id', id)
      if (err) throw err
      categories.value = categories.value.filter((c) => c.id !== id)
    } catch (err) {
      error.value = err.message || 'Gagal menghapus kategori.'
      throw err
    }
  }

  async function fetchRelatedDevices(categoryName) {
    const { data, error: err } = await supabase
      .from('devices')
      .select('name')
      .ilike('category', categoryName)
    if (err) throw err
    return [...new Set((data || []).map((d) => d.name))]
  }

  return {
    categories,
    loading,
    saving,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchRelatedDevices,
  }
}