import React, { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react'; // Iconos opcionales

type PdfUploaderProps = {
    onUploadSuccess: (url: string) => void;
};

const PdfUploader: React.FC<PdfUploaderProps> = ({ onUploadSuccess }) => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            const fileURL = URL.createObjectURL(file);
            setPdfPreviewUrl(fileURL);

            // Simula la subida del archivo
            setTimeout(() => {
                onUploadSuccess(fileURL); // Puedes reemplazar esto con la URL real de tu backend
                console.log("Archivo subido:", fileURL);
            }, 1000);
        } else {
            setPdfFile(null);
            setPdfPreviewUrl(null);
        }
    };

    const handleRemoveFile = () => {
        setPdfFile(null);
        setPdfPreviewUrl(null);
    };

    return (
        <div className="space-y-4">
            {!pdfFile && (
                <label className="inline-flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out">
                    <FileText className="w-5 h-5" />
                    <span>Subir PDF</span>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>
            )}

            {pdfPreviewUrl && (
                <div className="border rounded p-4 bg-gray-50 shadow-sm">
                    <p className="text-sm font-semibold mb-2">Vista previa del PDF:</p>
                    <p className="text-xs text-gray-700 mb-2">
                        📄 <strong>Archivo:</strong> {pdfFile?.name}
                    </p>
                    <iframe
                        src={pdfPreviewUrl}
                        title="Vista previa PDF"
                        width="100%"
                        height="400px"
                        className="border"
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
        </div>
    );
};

export default PdfUploader;

