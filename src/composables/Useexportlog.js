import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useExportLog() {
  const logs = ref([])
  const loading = ref(false)

  async function fetchExportLogs() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('export_logs')
        .select('*, profiles(name, email)')
        .order('created_at', { ascending: false })
      if (error) throw error
      logs.value = data || []
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function deleteExportLog(id) {
    const { error } = await supabase.from('export_logs').delete().eq('id', id)
    if (error) throw error
    logs.value = logs.value.filter((log) => log.id !== id)
  }

  return { logs, loading, fetchExportLogs, deleteExportLog }
}