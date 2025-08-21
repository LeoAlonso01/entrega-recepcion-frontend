// app/dashboard/actas/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ActaPDFGenerator from '../../../../components/ActaPDFGenerator';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Simulación de datos - reemplaza con tu API real
const mockActaData = {
  id: 1,
  unidad_responsable: "Defensoría de los Derechos Humanos Universitarios Nicolaitas",
  folio: "212-0077",
  fecha: "2024-01-15",
  hora: "14:30",
  comisionado: "Lic. Carlos Mendoza López",
  oficio_comision: "OF-2024-0156",
  fecha_oficio_comision: "2024-01-10",
  entrante: "Ing. María Fernanda García Hernández",
  ine_entrante: "GAHF800101MDFRRN01",
  fecha_inicio_labores: "2024-01-16",
  nombramiento: "Nombramiento definitivo",
  fecha_nombramiento: "2024-01-01",
  asignacion: "Jefe de Departamento de Pruebas",
  asignado_por: "Dirección General de Administración",
  domicilio_entrante: "Av. Insurgentes Sur #123, Col. Condesa, CDMX",
  telefono_entrante: "555-123-4567",
  saliente: "Ing. Juan Carlos Rodríguez Pérez",
  fecha_fin_labores: "2024-01-15",
  testigo_entrante: "Lic. Ana Laura Martínez Sánchez",
  ine_testigo_entrante: "MASL850505MDFRNN02",
  testigo_saliente: "C.P. Roberto Sánchez García",
  ine_testigo_saliente: "SAGR750810HDFNRN03",
  fecha_cierre_acta: "2024-01-15",
  hora_cierre_acta: "16:45",
  observaciones: "Se entrega equipo de cómputo completo: laptop Dell, monitor, teclado y mouse. Documentación en orden.",
  estado: "Completado",
  creado_en: "2024-01-15T16:50:00Z",
  actualizado_en: "2024-01-15T16:50:00Z"
};

const mockAnexosData = [
  {
    id: 1,
    clave: "MJ-01",
    datos: {
      nombre: "ADMINISTRATIVO DE ACTUACION",
      no_fojas: "5",
      observaciones: "Documentación completa"
    },
    estado: "Completado",
    unidad_responsable_id: 1
  },
  {
    id: 2,
    clave: "EO-01",
    datos: {
      nombre: "ORGANIGRAMA GENERAL",
      no_fojas: "3",
      observaciones: "Versión actualizada"
    },
    estado: "Completado",
    unidad_responsable_id: 1
  }
];

async function getActa(id: string) {
  // En una implementación real, harías una llamada a tu API
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/actas/${id}`);
  // if (!res.ok) return null;
  // return res.json();
  
  // Simulación para demostración
  if (id === "1") return mockActaData;
  return null;
}

async function getAnexos(unidadId: number) {
  // En una implementación real:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/anexos?unidad_id=${unidadId}`);
  // if (!res.ok) return [];
  // return res.json();
  
  return mockAnexosData;
}

export default async function ActaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const acta = await getActa(id);
  
  if (!acta) {
    notFound();
  }

  const anexos = await getAnexos(/* acta.unidad_responsable_id */ 1);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link href="/dashboard/actas" className="text-blue-500 hover:text-blue-700 mb-4 inline-block">
        ← Volver al listado de actas
      </Link>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Acta de Entrega-Recepción</h1>
      <p className="text-gray-600 mb-6">Folio: {acta.folio}</p>
      
      {/* Tarjeta de información principal */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Información General</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Unidad Responsable:</span> {acta.unidad_responsable}</p>
            <p><span className="font-medium">Fecha:</span> {formatDate(acta.fecha)}</p>
            <p><span className="font-medium">Hora:</span> {acta.hora}</p>
            <p><span className="font-medium">Comisionado:</span> {acta.comisionado}</p>
          </div>
          <div>
            <p><span className="font-medium">Estado:</span> <span className={`px-2 py-1 rounded text-xs ${getStatusColor(acta.estado)}`}>{acta.estado}</span></p>
            <p><span className="font-medium">Oficio de Comisión:</span> {acta.oficio_comision}</p>
            <p><span className="font-medium">Fecha oficio:</span> {formatDate(acta.fecha_oficio_comision)}</p>
          </div>
        </div>
      </div>

      {/* Información de participantes */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Participantes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-lg mb-2 text-blue-600">Persona que entrega (Saliente)</h3>
            <p><span className="font-medium">Nombre:</span> {acta.saliente}</p>
            <p><span className="font-medium">Fecha fin de labores:</span> {formatDate(acta.fecha_fin_labores)}</p>
            <p><span className="font-medium">Asignación:</span> {acta.asignacion}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2 text-green-600">Persona que recibe (Entrante)</h3>
            <p><span className="font-medium">Nombre:</span> {acta.entrante}</p>
            <p><span className="font-medium">INE:</span> {acta.ine_entrante}</p>
            <p><span className="font-medium">Domicilio:</span> {acta.domicilio_entrante}</p>
            <p><span className="font-medium">Teléfono:</span> {acta.telefono_entrante}</p>
            <p><span className="font-medium">Fecha inicio de labores:</span> {formatDate(acta.fecha_inicio_labores)}</p>
          </div>
        </div>
      </div>

      {/* Anexos */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Anexos ({anexos.length})</h2>
        
        {anexos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Clave</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">No. Foja</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {anexos.map((anexo) => (
                  <tr key={anexo.id} className="border-b">
                    <td className="px-4 py-2">{anexo.clave}</td>
                    <td className="px-4 py-2">{anexo.datos?.nombre || 'N/A'}</td>
                    <td className="px-4 py-2">{anexo.datos?.no_fojas || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(anexo.estado)}`}>
                        {anexo.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay anexos registrados para esta acta.</p>
        )}
      </div>

      {/* Observaciones */}
      {acta.observaciones && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Observaciones</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{acta.observaciones}</p>
        </div>
      )}

      {/* Botón para generar PDF */}
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Generar Documento</h2>
        <ActaPDFGenerator actaData={acta} anexosData={anexos} />
      </div>
    </div>
  );
}

// Funciones auxiliares
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'activo':
    case 'completado':
      return 'bg-green-100 text-green-800';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelado':
    case 'inactivo':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Metadata para SEO
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const acta = await getActa(id);
  
  return {
    title: acta ? `Acta ${acta.folio} - Sistema de Actas` : 'Acta no encontrada',
    description: acta ? `Detalles del acta de entrega-recepción ${acta.folio}` : 'Acta no encontrada',
  };
}