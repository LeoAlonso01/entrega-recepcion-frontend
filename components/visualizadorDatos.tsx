// components/VisualizadorDatos.tsx
import React from "react";

interface VisualizadorDatosProps {
  datos: Array<Record<string, any>> | Record<string, any> | null;
  clave: string;
}

const VisualizadorDatos: React.FC<VisualizadorDatosProps> = ({ datos, clave }) => {
  if (!datos) {
    return <p className="text-gray-500">No hay datos disponibles.</p>;
  }

  // Convertir a array si es un objeto único
  const dataArray = Array.isArray(datos) ? datos : [datos];

  // Caso 1: Es un archivo PDF (tiene url o un array de url)
  if (dataArray.length === 1 && typeof dataArray[0] === "object" && dataArray[0].url) {
    // Si url es un array (como en el caso de la base de datos)
    const urlField = dataArray[0].url;
    let pdfUrl = null;
    if (Array.isArray(urlField) && urlField.length > 0 && urlField[0].url) {
      pdfUrl = urlField[0].url;
    } else if (typeof urlField === "string") {
      pdfUrl = urlField;
    }

    // Si la url es relativa, anteponer el dominio del backend
    if (pdfUrl && pdfUrl.startsWith("/")) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      pdfUrl = apiUrl.replace(/\/$/, "") + pdfUrl;
    }

    if (pdfUrl) {
      return (
        <div className="w-full">
          <a className="text-blue-600 hover:underline " href={pdfUrl} target="_blank" rel="noopener noreferrer">
            Ver PDF
          </a>
        </div>
      );
    }
  }

  // Caso 2: Es una tabla (ej: RRH01, MJ01)
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Object.keys(dataArray[0]).map((key) => (
              <th
                key={key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {key.replace(/_/g, " ").toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dataArray.map((fila, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {Object.values(fila).map((valor, j) => (
                <td key={j} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {valor?.toString() || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisualizadorDatos;