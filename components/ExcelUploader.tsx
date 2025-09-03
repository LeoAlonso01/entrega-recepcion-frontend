import React, { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { FileSpreadsheet } from "lucide-react";
import { validarNombredeArchivo } from "@/lib/valildaciones"; // Asegúrate del nombre correcto del archivo

interface ExcelUploaderProps {
  onUploadSuccess: (rows: any[]) => void;
  onUploadError?: (error: string) => void;
  clave?: string;
}

const ExcelUploader = ({ onUploadSuccess, onUploadError, clave }: ExcelUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      const errorMsg = "Solo se permiten archivos Excel (.xlsx, .xls)";
      setError(errorMsg);
      onUploadError?.(errorMsg);
      toast.error(errorMsg);
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
          const errorMsg = "El archivo está vacío o no tiene datos válidos.";
          setError(errorMsg);
          onUploadError?.(errorMsg);
          toast.warning(errorMsg);
        }
      } catch (err) {
        const errorMsg = "Error al procesar el Excel";
        console.error(errorMsg, err);
        setError(errorMsg);
        onUploadError?.(errorMsg);
        toast.error(errorMsg);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    setError(null);

    // Validar nombre si hay clave
    if (clave) {
      const { valido, mensaje } = validarNombredeArchivo(file, clave);
      if (!valido) {
        setError(mensaje ?? "Nombre de archivo inválido");
        toast.error(mensaje);
        return;
      }
    }

    // Procesar archivo
    handleFile(file);
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
    if (file) {
      // Validar nombre si hay clave
      if (clave) {
        const { valido, mensaje } = validarNombredeArchivo(file, clave);
        if (!valido) {
          toast.error(mensaje);
          return;
        }
      }
      handleFile(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-md cursor-pointer w-fit hover:bg-green-700 transition ${
        isDragging ? "bg-green-800" : ""
      }`}
    >
      <FileSpreadsheet className="w-5 h-5" />
      <span>Subir Excel</span>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="text-sm text-red-200 mt-1">{error}</p>}
    </div>
  );
};

export default ExcelUploader;
