import React, { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { FileSpreadsheet } from "lucide-react"; // Ícono de Excel

interface ExcelUploaderProps {
    onUploadSuccess: (rows: any[]) => void;
}

const ExcelUploader = ({ onUploadSuccess }: ExcelUploaderProps) => {
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
            onUploadSuccess(json); // 🔹 Lo pasamos al padre
        };
        toast.success("Archivo subido con éxito");
        reader.readAsBinaryString(file);
    };

 return (
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
    );
};

export default ExcelUploader;

