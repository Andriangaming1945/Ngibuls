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

    const { userId } = await req.json()
    if (!userId) return json({ error: 'userId wajib diisi.' }, 400)
    if (userId === caller.id) return json({ error: 'Tidak bisa menghapus akun sendiri.' }, 400)

    const adminClient = createClient(supabaseUrl, serviceKey)

    await adminClient.from('saved_recommendations').delete().eq('profile_id', userId)
    await adminClient.from('water_activities').delete().eq('profile_id', userId)
    await adminClient.from('devices').delete().eq('profile_id', userId)
    await adminClient.from('profiles').delete().eq('id', userId)

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteAuthError) return json({ error: deleteAuthError.message }, 400)

    return json({ success: true }, 200)
  } catch (err) {
    return json({ error: err.message }, 500)
  }
})