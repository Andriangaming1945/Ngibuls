import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatRupiah, formatTanggal, budgetPreferenceLabel, priorityListFor } from './Pdfexporthelpers'

// payload: array snapshot device { id, name, category, watt, unit, unit_count,
// status, recommendations: [{ user_label, current_value, suggested_value,
// potential_saving_cost, budget_preference, created_at }] }
//
// Dipakai di dua tempat:
// 1. PerangkatListrikTab.vue -> saat export pertama kali
// 2. LaporanHistoryTable.vue -> saat unduh ulang dari riwayat, dari payload
//    yang tersimpan di export_logs (hasilnya persis sama dengan PDF asli).
export function buildExportPdf(payload) {
  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFontSize(16)
  doc.setTextColor(15, 23, 42)
  doc.text('Daftar Perangkat Listrik - Ngibuls', 14, 18)

  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`Diekspor pada ${formatTanggal(new Date(), { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 24)

  autoTable(doc, {
    startY: 30,
    head: [['No', 'Perangkat', 'Kategori', 'Daya Default', 'Satuan', 'Status']],
    body: payload.map((d, i) => [
      i + 1,
      d.name,
      d.category,
      `${d.watt} W`,
      `${d.unit_count ?? 1} ${d.unit}`,
      d.status === 'active' ? 'Aktif' : 'Nonaktif',
    ]),
    headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 9, cellPadding: 4, textColor: [15, 23, 42] },
    margin: { left: 14, right: 14 },
  })

  let cursorY = doc.lastAutoTable.finalY + 10

  function ensureSpace(minSpace) {
    if (cursorY > pageHeight - minSpace) {
      doc.addPage()
      cursorY = 20
    }
  }

  for (const d of payload) {
    const recs = d.recommendations || []
    if (recs.length === 0) {
      cursorY += 4
      continue
    }

    ensureSpace(40)

    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text(`Riwayat Rekomendasi: ${d.name}`, 14, cursorY)
    cursorY += 4

    autoTable(doc, {
      startY: cursorY,
      head: [['Pengguna', 'Dari', 'Ke', 'Potensi Hemat/Bulan', 'Preferensi', 'Tanggal']],
      body: recs.map((r) => [
        r.user_label || '-',
        r.current_value,
        r.suggested_value,
        formatRupiah(r.potential_saving_cost),
        budgetPreferenceLabel[r.budget_preference] || 'Tanpa Biaya',
        formatTanggal(r.created_at),
      ]),
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3, textColor: [15, 23, 42] },
      margin: { left: 14, right: 14 },
    })

    cursorY = doc.lastAutoTable.finalY + 6

    for (const r of recs) {
      ensureSpace(45)

      doc.setFontSize(9.5)
      doc.setTextColor(51, 65, 85)
      doc.text(`Detail Prioritas — ${r.user_label} (${formatTanggal(r.created_at)})`, 14, cursorY)
      cursorY += 3

      autoTable(doc, {
        startY: cursorY,
        head: [['Tingkat Prioritas', 'Penjelasan']],
        body: priorityListFor(r, d.name).map((p) => [p.level, p.text]),
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 3, textColor: [15, 23, 42] },
        columnStyles: { 0: { cellWidth: 35 } },
        margin: { left: 14, right: 14 },
      })

      cursorY = doc.lastAutoTable.finalY + 6
    }

    cursorY += 4
  }

  return doc
}