import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useAdminRecommendations() {
  const list = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  async function fetchAll() {
    loading.value = true
    error.value = ''
    try {
      const { data, error: err } = await supabase
        .from('saved_recommendations')
        .select('*, profiles(email, name)')
        .order('created_at', { ascending: false })
      if (err) throw err
      list.value = data || []
    } catch (err) {
      error.value = err.message || 'Gagal memuat data rekomendasi.'
    } finally {
      loading.value = false
    }
  }

  async function updateRecommendation(id, payload) {
    saving.value = true
    error.value = ''
    try {
      const { error: err } = await supabase.from('saved_recommendations').update(payload).eq('id', id)
      if (err) throw err
      await fetchAll()
    } catch (err) {
      error.value = err.message || 'Gagal memperbarui data.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function deleteRecommendation(id) {
    error.value = ''
    try {
      const { error: err } = await supabase.from('saved_recommendations').delete().eq('id', id)
      if (err) throw err
      list.value = list.value.filter((r) => r.id !== id)
    } catch (err) {
      error.value = err.message || 'Gagal menghapus data.'
      throw err
    }
  }

  return { list, loading, saving, error, fetchAll, updateRecommendation, deleteRecommendation }
}