import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

/**
 * Composable untuk manajemen akun pengguna (admin).
 * Mengasumsikan tabel `profiles` di Supabase dengan kolom:
 *   id, name, email, role, status, avatar_url, last_login, created_at
 * Sesuaikan nama tabel/kolom di bawah kalau skema kamu berbeda.
 */
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
    const { data, error: err } = await supabase.functions.invoke('create-user', {
      body: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        status: payload.status,
      },
    })

    if (err) throw err
    return data
  }

  async function updateUser(id, payload) {
    const { data, error: err } = await supabase
      .from('profiles')
      .update({
        name: payload.name,
        email: payload.email,
        role: payload.role,
        status: payload.status,
      })
      .eq('id', id)
      .select()
      .single()

    if (err) throw err
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
    return data
  }

  /**
   * Menghapus user. Menghapus baris di `profiles` saja aman dari client.
   * Menghapus akun auth-nya (supabase.auth.admin.deleteUser) juga perlu
   * lewat Edge Function dengan service_role key, sama seperti createUser.
   */
  async function deleteUser(id) {
    const { error: err } = await supabase.from('profiles').delete().eq('id', id)
    if (err) throw err

    // Opsional: panggil Edge Function untuk hapus akun auth-nya juga.
    // await supabase.functions.invoke('delete-user', { body: { id } })
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