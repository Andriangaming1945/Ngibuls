import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useSavedRecommendations() {
  const recommendations = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const error = ref('')

  async function fetchRecommendations() {
    loading.value = true
    error.value = ''
    try {
      const { data, error: err } = await supabase
        .from('saved_recommendations')
        .select('*, profiles:profile_id (name, email)')
        .order('created_at', { ascending: false })
      if (err) throw err
      recommendations.value = data || []
    } catch (err) {
      error.value = err.message || 'Gagal memuat riwayat rekomendasi.'
    } finally {
      loading.value = false
    }
  }

  async function createRecommendation(payload) {
    saving.value = true
    error.value = ''
    try {
      const { data, error: err } = await supabase
        .from('saved_recommendations')
        .insert([payload])
        .select('*, profiles:profile_id (name, email)')
      if (err) throw err
      if (data && data[0]) recommendations.value.unshift(data[0])
      return data
    } catch (err) {
      error.value = err.message || 'Gagal menambah rekomendasi.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function updateRecommendation(id, payload) {
    saving.value = true
    error.value = ''
    try {
      const { data, error: err } = await supabase
        .from('saved_recommendations')
        .update(payload)
        .eq('id', id)
        .select('*, profiles:profile_id (name, email)')
      if (err) throw err
      const idx = recommendations.value.findIndex((r) => r.id === id)
      if (idx !== -1 && data && data[0]) recommendations.value[idx] = data[0]
      return data
    } catch (err) {
      error.value = err.message || 'Gagal memperbarui rekomendasi.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function deleteRecommendation(id) {
    deleting.value = true
    error.value = ''
    try {
      const { error: err } = await supabase.from('saved_recommendations').delete().eq('id', id)
      if (err) throw err
      recommendations.value = recommendations.value.filter((r) => r.id !== id)
    } catch (err) {
      error.value = err.message || 'Gagal menghapus riwayat.'
      throw err
    } finally {
      deleting.value = false
    }
  }

  return {
    recommendations,
    loading,
    saving,
    deleting,
    error,
    fetchRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation,
  }
}