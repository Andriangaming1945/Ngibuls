import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) return json({ error: 'Unauthorized' }, 401)

    const { data: callerProfile } = await callerClient.from('profiles').select('role').eq('id', caller.id).single()
    if (callerProfile?.role !== 'admin') return json({ error: 'Forbidden' }, 403)

    const { email, password, name, role, status } = await req.json()
    if (!email || !password || !name) return json({ error: 'Data tidak lengkap.' }, 400)
    if (password.length < 8) return json({ error: 'Password minimal 8 karakter.' }, 400)
    if (role && !['admin', 'user'].includes(role)) return json({ error: 'Role tidak valid.' }, 400)

    const adminClient = createClient(supabaseUrl, serviceKey)

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })
    if (createError) return json({ error: createError.message }, 400)

    const { data: newProfile, error: profileError } = await adminClient
      .from('profiles')
      .upsert({ id: created.user.id, email, name, role: role || 'user', status: status || 'active' })
      .select()
      .single()

    if (profileError) {
      await adminClient.auth.admin.deleteUser(created.user.id)
      return json({ error: profileError.message }, 400)
    }

    return json({ profile: newProfile }, 200)
  } catch (err) {
    return json({ error: err.message }, 500)
  }
})