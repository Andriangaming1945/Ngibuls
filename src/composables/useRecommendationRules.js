import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

function parseTrigger(triggerRaw) {
  try {
    const parsed = JSON.parse(triggerRaw)
    if (parsed && parsed.metric && parsed.operator && parsed.value !== undefined) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

function compare(actual, operator, target) {
  switch (operator) {
    case '>': return actual > target
    case '>=': return actual >= target
    case '<': return actual < target
    case '<=': return actual <= target
    case '==': return actual === target
    default: return false
  }
}

export function useRecommendationRules() {
  // ---------- State CRUD rules ----------
  const rules = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  // ---------- State rekomendasi otomatis ----------
  const autoRecommendations = ref([])
  const autoLoading = ref(false)
  const autoError = ref('')

  // ---------- CRUD: recommendation_rules ----------
  async function fetchRules() {
    loading.value = true
    error.value = ''
    try {
      const { data, error: err } = await supabase
        .from('recommendation_rules')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      rules.value = data || []
    } catch (err) {
      error.value = err.message || 'Gagal memuat data rekomendasi.'
    } finally {
      loading.value = false
    }
  }

  async function createRule(payload) {
    saving.value = true
    error.value = ''
    try {
      const { data, error: err } = await supabase
        .from('recommendation_rules')
        .insert([{
          title: payload.title,
          type: payload.type,
          trigger_condition: payload.trigger,
          description: payload.description,
          suggestion: payload.suggestion,
          saving_estimate: payload.saving_estimate,
          status: payload.status ?? 'active',
        }])
        .select()
      if (err) throw err
      if (data && data[0]) rules.value.unshift(data[0])
      return data
    } catch (err) {
      error.value = err.message || 'Gagal menambah rekomendasi.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function updateRule(id, payload) {
    saving.value = true
    error.value = ''
    try {
      const { data, error: err } = await supabase
        .from('recommendation_rules')
        .update({
          title: payload.title,
          type: payload.type,
          trigger_condition: payload.trigger,
          description: payload.description,
          suggestion: payload.suggestion,
          saving_estimate: payload.saving_estimate,
          status: payload.status,
        })
        .eq('id', id)
        .select()
      if (err) throw err
      const idx = rules.value.findIndex((r) => r.id === id)
      if (idx !== -1 && data && data[0]) rules.value[idx] = data[0]
      return data
    } catch (err) {
      error.value = err.message || 'Gagal memperbarui rekomendasi.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function deleteRule(id) {
    error.value = ''
    try {
      const { error: err } = await supabase
        .from('recommendation_rules')
        .delete()
        .eq('id', id)
      if (err) throw err
      rules.value = rules.value.filter((r) => r.id !== id)
    } catch (err) {
      error.value = err.message || 'Gagal menghapus rekomendasi.'
      throw err
    }
  }

  // ---------- Auto-match: devices & water_activities vs rules ----------
  async function fetchAutoRecommendations() {
    autoLoading.value = true
    autoError.value = ''
    try {
      const [ruleRes, deviceRes, waterRes] = await Promise.all([
        supabase.from('recommendation_rules').select('*').eq('status', 'active'),
        supabase.from('devices').select('*, profiles:profile_id (name, email)').is('deleted_at', null),
        supabase.from('water_activities').select('*, profiles:profile_id (name, email)'),
      ])

      if (ruleRes.error) throw ruleRes.error
      if (deviceRes.error) throw deviceRes.error
      if (waterRes.error) throw waterRes.error

      const activeRules = ruleRes.data || []
      const devices = deviceRes.data || []
      const waterActivities = waterRes.data || []

      const listrikRules = activeRules.filter((r) => r.type === 'Listrik')
      const airRules = activeRules.filter((r) => r.type === 'Air')

      const results = []

      for (const device of devices) {
        for (const rule of listrikRules) {
          const cond = parseTrigger(rule.trigger_condition)
          if (!cond) continue
          const actual = device[cond.metric]
          if (actual === undefined || actual === null) continue
          if (compare(Number(actual), cond.operator, Number(cond.value))) {
            results.push({
              rule,
              contributorType: 'device',
              contributorName: device.name,
              ownerName: device.profiles?.name || '-',
              ownerEmail: device.profiles?.email || '-',
              matchedValue: actual,
              condition: cond,
            })
          }
        }
      }

      for (const activity of waterActivities) {
        for (const rule of airRules) {
          const cond = parseTrigger(rule.trigger_condition)
          if (!cond) continue
          const actual = activity[cond.metric]
          if (actual === undefined || actual === null) continue
          if (compare(Number(actual), cond.operator, Number(cond.value))) {
            results.push({
              rule,
              contributorType: 'water',
              contributorName: activity.name,
              ownerName: activity.profiles?.name || '-',
              ownerEmail: activity.profiles?.email || '-',
              matchedValue: actual,
              condition: cond,
            })
          }
        }
      }

      autoRecommendations.value = results
    } catch (err) {
      autoError.value = err.message || 'Gagal memuat rekomendasi otomatis.'
    } finally {
      autoLoading.value = false
    }
  }

  return {
    // CRUD
    rules,
    loading,
    saving,
    error,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    // Auto-match
    autoRecommendations,
    autoLoading,
    autoError,
    fetchAutoRecommendations,
  }
}