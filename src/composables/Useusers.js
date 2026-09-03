import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useUsers() {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, name, email, role, status, avatar_url, last_login, created_at')
        .order('created_at', { ascending: false })

      if (err) throw err
      users.value = data || []
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createUser(payload) {
    if (!['user', 'admin'].includes(payload.role)) {
      throw new Error('Role tidak valid.')
    }

    const { data, error: err } = await supabase.functions.invoke('admin-create-user', {
      body: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        status: payload.status,
      },
    })

    if (err) throw err
    if (data?.error) throw new Error(data.error)

    users.value.unshift(data.profile)
    return data.profile
  }

  async function updateUser(id, payload) {
    if (!['user', 'admin'].includes(payload.role)) {
      throw new Error('Role tidak valid.')
    }

    const { data, error: err } = await supabase
      .from('profiles')
      .update({
        name: payload.name,
        role: payload.role,
        status: payload.status,
      })
      .eq('id', id)
      .select()
      .single()

    if (err) throw err

    const idx = users.value.findIndex((u) => u.id === id)
    if (idx !== -1) users.value[idx] = data
    return data
  }

  async function updateUserStatus(id, status) {
    const { data, error: err } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (err) throw err

    const idx = users.value.findIndex((u) => u.id === id)
    if (idx !== -1) users.value[idx] = data
    return data
  }

  async function deleteUser(id) {
    const { data, error: err } = await supabase.functions.invoke('admin-delete-user', {
      body: { userId: id },
    })

    if (err) throw err
    if (data?.error) throw new Error(data.error)

    users.value = users.value.filter((u) => u.id !== id)
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
  }
}