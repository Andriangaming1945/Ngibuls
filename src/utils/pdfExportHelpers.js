// Helper yang dipakai bersama oleh PerangkatListrikTab (generate PDF)
// dan Laporan/LaporanDetailModal (preview di layar), supaya isi PDF
// dan isi tampilan laporan tidak pernah beda.

export function formatRupiah(n) {
  return `Rp${Number(n || 0).toLocaleString('id-ID')}`
}

export function formatTanggal(dateStr, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', opts)
}

export const budgetPreferenceLabel = {
  none: 'Tanpa Biaya',
  low: 'Budget Rendah',
  invest: 'Bersedia Investasi',
}

export const scopeLabel = {
  single: 'Satu Perangkat',
  selected: 'Perangkat Terpilih',
  all: 'Semua Perangkat',
}

const tipsByPreference = {
  none: [
    'Matikan perangkat saat tidak digunakan, jangan biarkan menyala tanpa alasan.',
    'Cabut charger atau adaptor yang masih tertancap meski tidak dipakai.',
  ],
  low: [
    'Ganti lampu rumah ke jenis LED yang lebih hemat listrik.',
    'Gunakan power strip dengan saklar supaya gampang mematikan beberapa perangkat sekaligus.',
  ],
  invest: [
    'Pertimbangkan perangkat dengan rating efisiensi energi lebih tinggi (misal AC inverter).',
    'Gunakan shower head hemat air untuk mengurangi konsumsi air harian.',
  ],
}

// Sama persis dengan logika lama di PerangkatListrikTab: budget_preference
// cuma 'none' | 'low' | 'invest', tips-nya statis per preferensi.
// Prioritas Tinggi dihitung dari current_value & suggested_value milik
// rekomendasi itu sendiri, bukan field baru.
export function priorityListFor(r, deviceName) {
  const tips = tipsByPreference[r.budget_preference] || tipsByPreference.none
  return [
    {
      level: 'Prioritas Tinggi',
      text: `Kurangi jam pemakaian ${deviceName} dari ${r.current_value} ke ${r.suggested_value} — dampaknya paling besar terhadap tagihan.`,
    },
    {
      level: 'Prioritas Sedang',
      text: tips[1] || tips[0],
    },
    {
      level: 'Mudah Dilakukan',
      text: tips[0],
    },
  ]
}