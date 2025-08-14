import React, { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { FileSpreadsheet } from "lucide-react"; // Ícono de Excel

interface ExcelUploaderProps {
    onUploadSuccess: (data: any) => void;
}

const ExcelUploader = ({ onUploadSuccess }: ExcelUploaderProps) => {
    const [jsonData, setJsonData] = useState<any[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const workbook = XLSX.read(bstr, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);
            setJsonData(json);
        };
        reader.readAsBinaryString(file);
    };

    const handleUpload = async () => {
        console.log("Datos JSON a enviar:", jsonData);
        toast.success("Datos enviados correctamente");
        setJsonData([]); // Limpia después de subir
    };

    

    return (
        <div className="space-y-4">
            <label className="flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-md cursor-pointer w-fit hover:bg-green-700 transition">
                <FileSpreadsheet className="w-5 h-5" />
                <span>Subir Excel</span>
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </label>

            {jsonData.length > 0 && (
                <div>
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                        {JSON.stringify(jsonData, null, 2)}
                    </pre>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleUpload}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => setJsonData([])}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelUploader;

