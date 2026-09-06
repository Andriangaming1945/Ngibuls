import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const user = ref(null)
const session = ref(null)
const profile = ref(null)
const authLoading = ref(true)
let initialized = false

function mapAuthError(error) {
  const msg = error?.message?.toLowerCase() || ''
  if (msg.includes('invalid login credentials')) return 'Email atau password salah'
  if (msg.includes('already registered')) return 'Email sudah terdaftar'
  if (msg.includes('email not confirmed')) return 'Email belum dikonfirmasi, cek inbox kamu'
  if (msg.includes('failed to fetch') || msg.includes('network')) return 'Koneksi bermasalah, coba lagi'
  return error?.message || 'Terjadi kesalahan, coba lagi'
}

async function fetchProfileById(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

async function fetchProfileByEmail(email) {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle()
  if (error) throw error
  return data
}

async function createProfile({ id, email, name }) {
  const { data, error } = await supabase.from('profiles').insert({ id, email, name }).select().single()
  if (error) throw error
  return data
}

async function updateProfile(updates) {
  if (!user.value?.id) throw new Error('Belum login')
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.value.id)
    .select()
    .single()
  if (error) throw error
  profile.value = data
  return data
}

async function initAuth() {
  if (initialized) return
  initialized = true

  const { data } = await supabase.auth.getSession()
  session.value = data.session
  user.value = data.session?.user ?? null

  if (user.value) {
    try {
      profile.value = await fetchProfileById(user.value.id)
    } catch {
      profile.value = null
    }
  }

  authLoading.value = false

  supabase.auth.onAuthStateChange(async (_event, newSession) => {
    session.value = newSession
    user.value = newSession?.user ?? null
    if (user.value) {
      try {
        profile.value = await fetchProfileById(user.value.id)
      } catch {
        profile.value = null
      }
    } else {
      profile.value = null
    }
  })
}

async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(mapAuthError(error))

  let foundProfile
  try {
    foundProfile = await fetchProfileById(data.user.id)
  } catch {
    await supabase.auth.signOut()
    throw new Error('Terjadi kesalahan saat memeriksa akun, coba lagi')
  }

  if (!foundProfile) {
    await supabase.auth.signOut()
    throw new Error('__NOT_REGISTERED__')
  }

  profile.value = foundProfile
  return foundProfile
}

async function register({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw new Error(mapAuthError(error))

  if (!data.session) {
    throw new Error('__CONFIRM_EMAIL__')
  }

  const newProfile = await createProfile({ id: data.user.id, email: data.user.email, name })
  profile.value = newProfile
  return newProfile
}

async function loginWithGoogle(intent) {
  localStorage.setItem('oauth_intent', intent)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) throw new Error(mapAuthError(error))
}

async function handleOAuthCallback() {
  const intent = localStorage.getItem('oauth_intent') || 'login'
  localStorage.removeItem('oauth_intent')

  const { data } = await supabase.auth.getSession()
  const oauthUser = data.session?.user

  if (!oauthUser) {
    throw new Error('Sesi Google tidak ditemukan, coba login ulang')
  }

  let foundProfile
  try {
    foundProfile = await fetchProfileByEmail(oauthUser.email)
  } catch {
    await supabase.auth.signOut()
    throw new Error('Terjadi kesalahan saat memeriksa akun, coba lagi')
  }

  if (intent === 'register') {
    if (foundProfile) {
      profile.value = foundProfile
      return { profile: foundProfile, redirect: '/dashboard' }
    }
    const name =
      oauthUser.user_metadata?.full_name || oauthUser.user_metadata?.name || oauthUser.email.split('@')[0]
    const newProfile = await createProfile({ id: oauthUser.id, email: oauthUser.email, name })
    profile.value = newProfile
    return { profile: newProfile, redirect: '/dashboard' }
  }

  if (!foundProfile) {
    await supabase.auth.signOut()
    throw new Error('__NOT_REGISTERED__')
  }
  profile.value = foundProfile
  return { profile: foundProfile, redirect: '/' }
}

async function logout() {
  await supabase.auth.signOut()
  user.value = null
  session.value = null
  profile.value = null
}

export function useAuth() {
  return {
    user,
    session,
    profile,
    authLoading,
    initAuth,
    login,
    register,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    fetchProfileById,
    fetchProfileByEmail,
    updateProfile,
  }
}