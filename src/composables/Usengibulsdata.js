import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'


export function useNgibulsData() {
  const { user } = useAuth()

  const profile = ref(null)
  const devices = ref([])
  const waterActivities = ref([])

  const loading = ref(false)
  const error = ref(null)

  function requireUserId() {
    const id = user.value?.id
    if (!id) throw new Error('User belum login.')
    return id
  }

  async function run(task) {
    loading.value = true
    error.value = null
    try {
      return await task()
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  // ---------------------------------------------------------
  // Profile
  // ---------------------------------------------------------
  async function loadProfile() {
    return run(async () => {
      const userId = requireUserId()
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (err) throw err
      profile.value = data
      return data
    })
  }

  async function updateProfile(updates) {
    return run(async () => {
      const userId = requireUserId()
      const { data, error: err } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (err) throw err
      profile.value = data
      return data
    })
  }

  // ---------------------------------------------------------
  // Devices
  // ---------------------------------------------------------
  async function loadDevices() {
    return run(async () => {
      const userId = requireUserId()
      const { data, error: err } = await supabase
        .from('devices')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: true })

      if (err) throw err
      devices.value = data
      return data
    })
  }

  async function addDevice(device) {
    return run(async () => {
      const userId = requireUserId()
      const { data, error: err } = await supabase
        .from('devices')
        .insert({ ...device, profile_id: userId })
        .select()
        .single()

      if (err) throw err
      devices.value.push(data)
      return data
    })
  }

  async function updateDevice(id, updates) {
    return run(async () => {
      const userId = requireUserId()
      const { data, error: err } = await supabase
        .from('devices')
        .update(updates)
        .eq('id', id)
        .eq('profile_id', userId)
        .select()
        .single()

      if (err) throw err
      const index = devices.value.findIndex((item) => item.id === id)
      if (index !== -1) devices.value[index] = data
      return data
    })
  }

  async function deleteDevice(id) {
    return run(async () => {
      const userId = requireUserId()
      const { error: err } = await supabase
        .from('devices')
        .delete()
        .eq('id', id)
        .eq('profile_id', userId)

      if (err) throw err
      devices.value = devices.value.filter((item) => item.id !== id)
    })
  }

  // ---------------------------------------------------------
  // Water activities
  // ---------------------------------------------------------
  async function loadWaterActivities() {
    return run(async () => {
      const userId = requireUserId()
      const { data, error: err } = await supabase
        .from('water_activities')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: true })

      if (err) throw err
      waterActivities.value = data
      return data
    })
  }

  async function addWaterActivity(activity) {
    return run(async () => {
      const userId = requireUserId()
      const { data, error: err } = await supabase
        .from('water_activities')
        .insert({ ...activity, profile_id: userId })
        .select()
        .single()

      if (err) throw err
      waterActivities.value.push(data)
      return data
    })
  }

  async function updateWaterActivity(id, updates) {
    return run(async () => {
      const userId = requireUserId()
      const { data, error: err } = await supabase
        .from('water_activities')
        .update(updates)
        .eq('id', id)
        .eq('profile_id', userId)
        .select()
        .single()

      if (err) throw err
      const index = waterActivities.value.findIndex((item) => item.id === id)
      if (index !== -1) waterActivities.value[index] = data
      return data
    })
  }

  async function deleteWaterActivity(id) {
    return run(async () => {
      const userId = requireUserId()
      const { error: err } = await supabase
        .from('water_activities')
        .delete()
        .eq('id', id)
        .eq('profile_id', userId)

      if (err) throw err
      waterActivities.value = waterActivities.value.filter((item) => item.id !== id)
    })
  }

  return {
    // state
    profile,
    devices,
    waterActivities,
    loading,
    error,
    // profile
    loadProfile,
    updateProfile,
    // devices
    loadDevices,
    addDevice,
    updateDevice,
    deleteDevice,
    // water activities
    loadWaterActivities,
    addWaterActivity,
    updateWaterActivity,
    deleteWaterActivity,
  }
}