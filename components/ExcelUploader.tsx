import React, { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { FileSpreadsheet } from "lucide-react";

interface ExcelUploaderProps {
  onUploadSuccess: (rows: any[]) => void;
}

const ExcelUploader = ({ onUploadSuccess }: ExcelUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Solo se permiten archivos Excel (.xlsx, .xls)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (Array.isArray(json) && json.length > 0) {
          onUploadSuccess(json);
          toast.success(`✅ Excel cargado: ${json.length} filas`);
        } else {
          toast.warning("El archivo está vacío o no tiene datos válidos.");
        }
      } catch (error) {
        toast.error("Error al procesar el Excel");
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-md cursor-pointer w-fit hover:bg-green-700 transition ${
        isDragging ? "bg-green-800" : ""
      }`}
    >
      <FileSpreadsheet className="w-5 h-5" />
      <span>Subir Excel</span>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default ExcelUploader;

