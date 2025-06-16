"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Download, FileSpreadsheet, FileText } from "lucide-react"

interface ExportDialogProps {
  title: string
  onExportPDF: (filters: ExportFilters) => void
  onExportExcel: (filters: ExportFilters) => void
  availableFilters?: {
    dateRange?: boolean
    status?: string[]
    type?: string[]
  }
}

export interface ExportFilters {
  dateFrom?: string
  dateTo?: string
  status?: string[]
  type?: string[]
  includeInactive?: boolean
}

export function ExportDialog({ title, onExportPDF, onExportExcel, availableFilters }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<ExportFilters>({
    status: [],
    type: [],
    includeInactive: true,
  })

  const handleExport = (format: "pdf" | "excel") => {
    if (format === "pdf") {
      onExportPDF(filters)
    } else {
      onExportExcel(filters)
    }
    setIsOpen(false)
  }

  const handleStatusChange = (status: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      status: checked ? [...(prev.status || []), status] : (prev.status || []).filter((s) => s !== status),
    }))
  }

  const handleTypeChange = (type: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      type: checked ? [...(prev.type || []), type] : (prev.type || []).filter((t) => t !== type),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[#24356B] text-[#24356B] hover:bg-[#24356B] hover:text-white">
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar {title}</DialogTitle>
          <DialogDescription>Configura los filtros y formato para tu reporte</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Date Range Filter */}
          {availableFilters?.dateRange && (
            <div className="space-y-2">
              <Label>Rango de Fechas</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="dateFrom" className="text-sm">
                    Desde
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo" className="text-sm">
                    Hasta
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status Filter */}
          {availableFilters?.status && (
            <div className="space-y-2">
              <Label>Estados a incluir</Label>
              <div className="space-y-2">
                {availableFilters.status.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status?.includes(status) || false}
                      onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Type Filter */}
          {availableFilters?.type && (
            <div className="space-y-2">
              <Label>Tipos a incluir</Label>
              <div className="space-y-2">
                {availableFilters.type.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.type?.includes(type) || false}
                      onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                    />
                    <Label htmlFor={`type-${type}`} className="text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Include Inactive */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeInactive"
              checked={filters.includeInactive}
              onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, includeInactive: checked as boolean }))}
            />
            <Label htmlFor="includeInactive" className="text-sm">
              Incluir registros inactivos
            </Label>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button onClick={() => handleExport("pdf")} className="bg-[#751518] hover:bg-[#751518]/90 text-white">
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={() => handleExport("excel")} className="bg-[#B59E60] hover:bg-[#B59E60]/90 text-white">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
