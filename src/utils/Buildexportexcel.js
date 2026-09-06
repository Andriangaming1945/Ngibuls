import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { formatRupiah, formatTanggal, budgetPreferenceLabel, priorityListFor } from './Pdfexporthelpers'

const HEADER_FILL = 'FF16A34A' // hijau, senada sama tombol Export PDF
const HEADER_FONT = { color: { argb: 'FFFFFFFF' }, bold: true }
const DARK_HEADER_FILL = 'FF334155' // slate, buat header tabel rekomendasi (samain sama PDF)
const ALT_ROW_FILL = 'FFF8FAFC'
const BORDER_COLOR = { argb: 'FFE2E8F0' }
const THIN_BORDER = { style: 'thin', color: BORDER_COLOR }

function styleHeaderRow(row, fill = HEADER_FILL) {
  row.height = 20
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }
    cell.font = HEADER_FONT
    cell.alignment = { vertical: 'middle', horizontal: 'left' }
    cell.border = { top: THIN_BORDER, left: THIN_BORDER, bottom: THIN_BORDER, right: THIN_BORDER }
  })
}

function styleBodyRow(row, index, { wrap = false } = {}) {
  row.eachCell((cell) => {
    cell.border = { top: THIN_BORDER, left: THIN_BORDER, bottom: THIN_BORDER, right: THIN_BORDER }
    cell.alignment = { vertical: wrap ? 'top' : 'middle', wrapText: wrap }
    if (index % 2 === 1) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ALT_ROW_FILL } }
    }
  })
}

// payload: sama persis dengan yang dipakai buildExportPdf & tersimpan di
// export_logs, jadi Excel dan PDF dari export yang sama isinya selalu cocok.
export async function buildExportExcel(payload) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Ngibuls'
  workbook.created = new Date()

  // --- Sheet 1: Daftar Perangkat ---
  const deviceSheet = workbook.addWorksheet('Daftar Perangkat', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  deviceSheet.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Perangkat', key: 'name', width: 24 },
    { header: 'Kategori', key: 'category', width: 18 },
    { header: 'Daya Default', key: 'watt', width: 16 },
    { header: 'Satuan', key: 'unit', width: 18 },
    { header: 'Status', key: 'status', width: 14 },
  ]
  styleHeaderRow(deviceSheet.getRow(1))

  payload.forEach((d, i) => {
    const row = deviceSheet.addRow({
      no: i + 1,
      name: d.name,
      category: d.category,
      watt: `${d.watt} W`,
      unit: `${d.unit_count ?? 1} ${d.unit}`,
      status: d.status === 'active' ? 'Aktif' : 'Nonaktif',
    })
    styleBodyRow(row, i)
  })

  // --- Sheet 2: Riwayat Rekomendasi (ringkas, gabungan semua perangkat) ---
  const recSheet = workbook.addWorksheet('Riwayat Rekomendasi', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  recSheet.columns = [
    { header: 'Perangkat', key: 'device', width: 20 },
    { header: 'Pengguna', key: 'user', width: 22 },
    { header: 'Dari', key: 'from', width: 14 },
    { header: 'Ke', key: 'to', width: 14 },
    { header: 'Potensi Hemat/Bulan', key: 'saving', width: 20 },
    { header: 'Preferensi', key: 'pref', width: 18 },
    { header: 'Tanggal', key: 'date', width: 16 },
  ]
  styleHeaderRow(recSheet.getRow(1))

  let recIndex = 0
  payload.forEach((d) => {
    ;(d.recommendations || []).forEach((r) => {
      const row = recSheet.addRow({
        device: d.name,
        user: r.user_label,
        from: r.current_value,
        to: r.suggested_value,
        saving: formatRupiah(r.potential_saving_cost),
        pref: budgetPreferenceLabel[r.budget_preference] || 'Tanpa Biaya',
        date: formatTanggal(r.created_at),
      })
      styleBodyRow(row, recIndex)
      recIndex += 1
    })
  })

  if (recIndex === 0) {
    const row = recSheet.addRow({ device: 'Tidak ada riwayat rekomendasi untuk export ini.' })
    styleBodyRow(row, 0)
  }

  // --- Sheet 3: Detail Prioritas (niru struktur blok per-rekomendasi di PDF) ---
  const detailSheet = workbook.addWorksheet('Detail Prioritas', {
    views: [{ state: 'frozen', ySplit: 0 }],
  })

  detailSheet.columns = [
    { key: 'a', width: 22 },
    { key: 'b', width: 90 },
  ]

  let hasAnyDetail = false

  payload.forEach((d) => {
    const recs = d.recommendations || []
    if (recs.length === 0) return
    hasAnyDetail = true

    // Judul perangkat
    const deviceTitleRow = detailSheet.addRow([`Riwayat Rekomendasi: ${d.name}`])
    detailSheet.mergeCells(deviceTitleRow.number, 1, deviceTitleRow.number, 2)
    deviceTitleRow.getCell(1).font = { bold: true, size: 13, color: { argb: 'FF0F172A' } }
    deviceTitleRow.height = 22

    recs.forEach((r) => {
      // Judul blok: "Detail Prioritas — user (tanggal)"
      const blockTitleRow = detailSheet.addRow([`Detail Prioritas — ${r.user_label} (${formatTanggal(r.created_at)})`])
      detailSheet.mergeCells(blockTitleRow.number, 1, blockTitleRow.number, 2)
      blockTitleRow.getCell(1).font = { bold: true, size: 11, color: { argb: 'FF334155' } }
      blockTitleRow.height = 20

      // Ringkasan singkat: dari -> ke, hemat, preferensi
      const summaryRow = detailSheet.addRow([
        'Ringkasan',
        `${r.current_value} → ${r.suggested_value}  ·  Potensi hemat ${formatRupiah(r.potential_saving_cost)}/bulan  ·  ${budgetPreferenceLabel[r.budget_preference] || 'Tanpa Biaya'}`,
      ])
      styleBodyRow(summaryRow, 0, { wrap: true })
      summaryRow.getCell(1).font = { bold: true }

      // Header tabel prioritas (samain warna sama PDF: slate utk header Riwayat, hijau utk header Prioritas)
      const priorityHeaderRow = detailSheet.addRow(['Tingkat Prioritas', 'Penjelasan'])
      styleHeaderRow(priorityHeaderRow, HEADER_FILL)

      priorityListFor(r, d.name).forEach((p, i) => {
        const row = detailSheet.addRow([p.level, p.text])
        styleBodyRow(row, i, { wrap: true })
        row.getCell(1).font = { bold: true, color: { argb: 'FF16A34A' } }
      })

      // Spacer antar blok rekomendasi
      detailSheet.addRow([])
    })

    // Spacer antar perangkat
    detailSheet.addRow([])
  })

  if (!hasAnyDetail) {
    detailSheet.addRow(['Tidak ada riwayat rekomendasi untuk export ini.'])
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function downloadExportExcel(payload, fileName = 'perangkat-listrik.xlsx') {
  const blob = await buildExportExcel(payload)
  saveAs(blob, fileName)
}