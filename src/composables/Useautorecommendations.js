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

export function useAutoRecommendations() {
  const autoRecommendations = ref([])
  const loading = ref(false)
  const error = ref('')

  async function fetchAutoRecommendations() {
    loading.value = true
    error.value = ''
    try {
      const [ruleRes, deviceRes, waterRes] = await Promise.all([
        supabase.from('recommendation_rules').select('*').eq('status', 'active'),
        supabase.from('devices').select('*, profiles:profile_id (name, email)').is('deleted_at', null),
        supabase.from('water_activities').select('*, profiles:profile_id (name, email)'),
      ])

      if (ruleRes.error) throw ruleRes.error
      if (deviceRes.error) throw deviceRes.error
      if (waterRes.error) throw waterRes.error

      const rules = ruleRes.data || []
      const devices = deviceRes.data || []
      const waterActivities = waterRes.data || []

      const listrikRules = rules.filter((r) => r.type === 'Listrik')
      const airRules = rules.filter((r) => r.type === 'Air')

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
      error.value = err.message || 'Gagal memuat rekomendasi otomatis.'
    } finally {
      loading.value = false
    }
  }

  return { autoRecommendations, loading, error, fetchAutoRecommendations }
}