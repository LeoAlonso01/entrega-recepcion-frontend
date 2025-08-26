import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react"; // iconos bonitos opcionales

function Recursos() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 border-t pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[#24356B] text-white text-sm font-medium hover:bg-[#1a274d] transition"
      >
        Recursos disponibles
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <a 
            href="https://www.contraloria.umich.mx/archivos/normatividad/lineamientos_entrega_recepcion_umsnh.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 transition"
          >
            📄 Lineamientos del Proceso de Entrega-Recepción
          </a>

          <a 
            href="https://www.contraloria.umich.mx/entregarecepcion/archivos/archivos_contraloria/guia_usuario_serumich.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 transition"
          >
            📄 Guía del Usuario SERUMICH
          </a>

          <a 
            href="https://www.contraloria.umich.mx/entregarecepcion/archivos/archivos_contraloria/instructivo_llenado_serumich.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 transition"
          >
            📄 Instructivo de Llenado de Anexos
          </a>

          <a 
            href="https://www.contraloria.umich.mx/entregarecepcion/archivos/anexos/plantillas_anexos.zip" 
            download="plantillas_anexos.zip"
            className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 transition"
          >
            ⬇️ Plantillas de Anexos
          </a>

          <a 
            href="https://www.contraloria.umich.mx/index.php/portal/entrega_recepcion" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 transition"
          >
            📨 Circulares emitidas por la Contraloría
          </a>
        </div>
      )}
    </div>
  );
}

export default Recursos;
