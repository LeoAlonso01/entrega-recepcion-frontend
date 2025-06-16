import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"

export interface ReportConfig {
  title: string
  filename: string
  headers: string[]
  data: any[]
  metadata?: {
    totalRecords?: number
    filters?: string[]
    additionalInfo?: string[]
  }
}

export class ReportGenerator {
  static generatePDF(config: ReportConfig): void {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(36, 53, 107) // #24356B
    doc.text(config.title, 20, 20)

    // Metadata
    let yPosition = 30
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)

    doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`, 20, yPosition)
    yPosition += 10

    if (config.metadata?.totalRecords) {
      doc.text(`Total de registros: ${config.metadata.totalRecords}`, 20, yPosition)
      yPosition += 10
    }

    if (config.metadata?.additionalInfo) {
      config.metadata.additionalInfo.forEach((info) => {
        doc.text(info, 20, yPosition)
        yPosition += 10
      })
    }

    if (config.metadata?.filters && config.metadata.filters.length > 0) {
      doc.text("Filtros aplicados:", 20, yPosition)
      yPosition += 10
      config.metadata.filters.forEach((filter) => {
        doc.text(`• ${filter}`, 25, yPosition)
        yPosition += 8
      })
      yPosition += 5
    }
    // Table
    ;(doc as any).autoTable({
      head: [config.headers],
      body: config.data,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [36, 53, 107], // #24356B
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
    })

    doc.save(`${config.filename}_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  static generateExcel(config: ReportConfig): void {
    // Main data sheet
    const wsData = config.data.map((row) => {
      const obj: any = {}
      config.headers.forEach((header, index) => {
        obj[header] = row[index]
      })
      return obj
    })

    const worksheet = XLSX.utils.json_to_sheet(wsData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")

    // Metadata sheet
    const metaData = [
      [config.title],
      [""],
      ["Fecha de generación:", new Date().toLocaleDateString("es-ES")],
      ["Total de registros:", config.metadata?.totalRecords?.toString() || config.data.length.toString()],
      [""],
    ]

    if (config.metadata?.additionalInfo) {
      metaData.push(["Información adicional:"])
      config.metadata.additionalInfo.forEach((info) => {
        metaData.push([info])
      })
      metaData.push([""])
    }

    if (config.metadata?.filters && config.metadata.filters.length > 0) {
      metaData.push(["Filtros aplicados:"])
      config.metadata.filters.forEach((filter) => {
        metaData.push([filter])
      })
    }

    const metaSheet = XLSX.utils.aoa_to_sheet(metaData)
    XLSX.utils.book_append_sheet(workbook, metaSheet, "Información")

    XLSX.writeFile(workbook, `${config.filename}_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  static generateSummaryReport(data: any[], groupBy: string, title: string): void {
    const summary = data.reduce(
      (acc, item) => {
        const key = item[groupBy]
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const summaryData = Object.entries(summary).map(([key, count]) => [key, count])

    const config: ReportConfig = {
      title: `${title} - Resumen por ${groupBy}`,
      filename: `resumen_${groupBy.toLowerCase()}`,
      headers: [groupBy, "Cantidad"],
      data: summaryData,
      metadata: {
        totalRecords: data.length,
        additionalInfo: [
          `Categorías encontradas: ${Object.keys(summary).length}`,
          `Promedio por categoría: ${(data.length / Object.keys(summary).length).toFixed(2)}`,
        ],
      },
    }

    this.generatePDF(config)
  }
}

export const formatDateRange = (from?: string, to?: string): string => {
  if (!from && !to) return "Todas las fechas"
  if (from && !to) return `Desde ${from}`
  if (!from && to) return `Hasta ${to}`
  return `${from} - ${to}`
}

export const formatFilters = (filters: any): string[] => {
  const result: string[] = []

  if (filters.dateFrom || filters.dateTo) {
    result.push(`Fechas: ${formatDateRange(filters.dateFrom, filters.dateTo)}`)
  }

  if (filters.status && filters.status.length > 0) {
    result.push(`Estados: ${filters.status.join(", ")}`)
  }

  if (filters.type && filters.type.length > 0) {
    result.push(`Tipos: ${filters.type.join(", ")}`)
  }

  if (filters.includeInactive !== undefined) {
    result.push(`Incluir inactivos: ${filters.includeInactive ? "Sí" : "No"}`)
  }

  return result.length > 0 ? result : ["Ningún filtro aplicado"]
}
