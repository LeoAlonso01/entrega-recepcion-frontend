import React, { useState } from 'react';
import { FileText, Trash2, Upload, X } from 'lucide-react';

type PdfUploaderProps = {
  onUploadSuccess: (data: { url: string }[]) => void; // Espera un array con { url }
};

const PdfUploader: React.FC<PdfUploaderProps> = ({ onUploadSuccess }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF.");
      setPdfFile(null);
      setPdfPreviewUrl(null);
      return;
    }

    setPdfFile(file);
    setPdfPreviewUrl(URL.createObjectURL(file));
    setError(null);

    // Simular previsualización y comenzar subida
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/pdf`, {
        method: "POST",
        body: formData,
        // No añadas 'Content-Type': fetch lo hace automáticamente con multipart
      });

      // Para simular progreso real (si tu backend no lo soporta)
      let progress = 0;
      const interval = setInterval(() => {
        if (progress < 95) {
          progress += 5;
          setUploadProgress(progress);
        }
      }, 400);

      // Esperar respuesta
      if (!response.ok) {
        clearInterval(interval);
        throw new Error("Error al subir el archivo");
      }

      const result = await response.json();
      clearInterval(interval);
      setUploadProgress(100);

      // Supongamos que el backend devuelve { file_url: "https://..." }
      const fileUrl = result.file_url || result.url || "URL no disponible";

      // Devolvemos el formato esperado: [{ "url": "..." }]
      onUploadSuccess([{ url: fileUrl }]);

      console.log("✅ PDF subido:", fileUrl);
    } catch (err: any) {
      setError(err.message || "Error al subir el archivo");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setPdfPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Botón de subida (solo si no hay archivo) */}
      {!pdfFile && !isUploading && (
        <label className="inline-flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200">
          <FileText className="w-5 h-5" />
          <span>Subir PDF</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      )}

      {/* Barra de progreso durante la subida */}
      {isUploading && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Subiendo {pdfFile?.name}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-700 mt-1">{uploadProgress}%</p>
        </div>
      )}

      {/* Vista previa y botón de eliminación */}
      {pdfPreviewUrl && !isUploading && (
        <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-sm font-semibold">📄 {pdfFile?.name}</p>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700"
              aria-label="Eliminar archivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <iframe
            src={pdfPreviewUrl}
            title="Vista previa del PDF"
            width="100%"
            height="400px"
            className="border rounded border-gray-300"
            style={{ minHeight: "300px" }}
          />

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleRemoveFile}
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar PDF
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default PdfUploader;

