import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { getCategoryForDevice } from '@/utils/deviceCategoryMap'

export function useDeviceCatalog() {
  const catalog = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  async function fetchCatalog() {
    loading.value = true
    error.value = ''
    try {
      // Tidak difilter deleted_at di sini — admin memang harus tetap melihat
      // row yang sudah dinonaktifkan (soft-deleted), supaya bisa diaktifkan lagi.
      const { data, error: err } = await supabase
        .from('devices')
        .select('id, name, watt, quantity, profile_id, updated_at, category, unit, status, deleted_at')

      if (err) throw err

      const groups = new Map()
      for (const row of data || []) {
        const key = row.name.trim().toLowerCase()
        if (!groups.has(key)) {
          groups.set(key, {
            name: row.name,
            category: row.category || getCategoryForDevice(row.name),
            unit: row.unit || 'unit',
            status: row.status || 'active',
            deletedAt: row.deleted_at,
            totalWatt: 0,
            unitCount: 0,
            userIds: new Set(),
            lastUpdated: row.updated_at,
          })
        }
        const g = groups.get(key)
        const qty = Number(row.quantity || 1)
        const watt = Number(row.watt || 0)
        g.totalWatt += watt * qty
        g.unitCount += qty
        if (row.profile_id) g.userIds.add(row.profile_id)
        // Status/deleted_at representatif diambil dari row yang paling baru
        // diupdate, supaya konsisten dengan toggle terakhir yang dilakukan
        // admin untuk device ini.
        if (row.updated_at && (!g.lastUpdated || new Date(row.updated_at) >= new Date(g.lastUpdated))) {
          g.lastUpdated = row.updated_at
          g.status = row.status || 'active'
          g.deletedAt = row.deleted_at
        }
      }

      catalog.value = Array.from(groups.values())
        .map((g) => ({
          id: g.name,
          name: g.name,
          category: getCategoryForDevice(g.name) !== 'Lainnya' ? getCategoryForDevice(g.name) : g.category,
          unit: g.unit,
          status: g.status,
          deleted_at: g.deletedAt,
          watt: g.unitCount > 0 ? Math.round(g.totalWatt / g.unitCount) : 0,
          unit_count: g.unitCount,
          user_count: g.userIds.size,
          updated_at: g.lastUpdated,
        }))
        .sort((a, b) => b.user_count - a.user_count)
    } catch (err) {
      error.value = err.message || 'Gagal memuat data perangkat.'
    } finally {
      loading.value = false
    }
  }

  async function fetchDeviceDetail(name) {
    const { data, error: err } = await supabase
      .from('devices')
      .select('id, name, watt, hours_per_day, days_per_month, quantity, updated_at, profile_id, profiles(name)')
      .ilike('name', name)
      .order('updated_at', { ascending: false })
    if (err) throw err
    return data || []
  }

  async function fetchDeviceRecommendations(name) {
    const { data, error: err } = await supabase
      .from('saved_recommendations')
      .select(
        'id, current_value, suggested_value, potential_saving_amount, potential_saving_cost, budget_preference, created_at, profile_id, profiles(name, email)'
      )
      .eq('contributor_type', 'device')
      .ilike('contributor_name', name)
      .order('created_at', { ascending: false })
    if (err) throw err
    return data || []
  }

  // Hapus semua saved_recommendations yang contributor-nya device dengan nama ini.
  // Dipakai saat device dinonaktifkan ATAU dihapus permanen — di kedua kasus itu
  // riwayat rekomendasi yang mereferensikan device tsb harus ikut hilang dari
  // sisi user, bukan cuma disembunyikan. ilike dipakai supaya gak kepeleset
  // masalah beda casing/spasi antara nama di 'devices' vs contributor_name di
  // 'saved_recommendations' (tabel ini gak diubah sama sekali, cuma query
  // delete biasa lewat kolom yang sudah ada).
  async function deleteRecommendationsForDevice(name) {
    const { error: err } = await supabase
      .from('saved_recommendations')
      .delete()
      .eq('contributor_type', 'device')
      .ilike('contributor_name', name)
    if (err) throw err
  }

  async function updateDevice(name, payload) {
    saving.value = true
    error.value = ''
    try {
      const { error: err } = await supabase.from('devices').update(payload).ilike('name', name)
      if (err) throw err
      await fetchCatalog()
    } catch (err) {
      error.value = err.message || 'Gagal memperbarui data perangkat.'
      throw err
    } finally {
      saving.value = false
    }
  }

  // Soft-delete/restore semua row 'devices' dengan nama yang sama.
  // 'inactive'  -> deleted_at diisi timestamp sekarang, row TETAP ADA di DB.
  //                Riwayat rekomendasi ('saved_recommendations') milik semua
  //                user untuk device ini ikut DIHAPUS PERMANEN — bukan cuma
  //                disembunyikan. Ini gak reversible: aktifin lagi devicenya
  //                gak bakal ngembaliin riwayat yang udah kehapus.
  // 'active'    -> deleted_at dikosongkan lagi (null), data device balik utuh
  //                persis seperti sebelumnya. Riwayat rekomendasi TIDAK
  //                dikembalikan (memang sudah terhapus permanen saat dinonaktifkan).
  // Ini yang dipakai dropdown status Aktif/Nonaktif di tabel.
  async function setDeviceActiveStatus(name, status) {
    error.value = ''
    try {
      const payload = {
        status,
        deleted_at: status === 'inactive' ? new Date().toISOString() : null,
      }
      const { error: err } = await supabase.from('devices').update(payload).ilike('name', name)
      if (err) throw err
      if (status === 'inactive') {
        await deleteRecommendationsForDevice(name)
      }
      await fetchCatalog()
    } catch (err) {
      error.value = err.message || 'Gagal memperbarui status perangkat.'
      throw err
    }
  }

  // Dipanggil dari tombol "Hapus" di menu titik tiga.
  // Menghapus permanen semua baris 'devices' dengan nama yang sama dari
  // database, SEKALIGUS semua 'saved_recommendations' milik semua user yang
  // mereferensikan device ini. Tidak bisa dikembalikan sama sekali. Kalau
  // cuma mau sembunyikan sementara dan masih bisa dipulihkan (device-nya,
  // bukan riwayatnya), pakai setDeviceActiveStatus(name, 'inactive') lewat
  // dropdown status, bukan fungsi ini — tapi perlu diingat, riwayat
  // rekomendasi tetap ikut kehapus permanen di kedua kasus (nonaktif maupun
  // hapus), sesuai behavior yang diminta.
  async function deleteDevice(name) {
    saving.value = true
    error.value = ''
    try {
      await deleteRecommendationsForDevice(name)
      const { error: err } = await supabase.from('devices').delete().ilike('name', name)
      if (err) throw err
      await fetchCatalog()
    } catch (err) {
      error.value = err.message || 'Gagal menghapus perangkat.'
      throw err
    } finally {
      saving.value = false
    }
  }

  return {
    catalog,
    loading,
    saving,
    error,
    fetchCatalog,
    fetchDeviceDetail,
    fetchDeviceRecommendations,
    deleteRecommendationsForDevice,
    updateDevice,
    setDeviceActiveStatus,
    deleteDevice,
  }
}