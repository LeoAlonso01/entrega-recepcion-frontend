"use client";

import React, { useEffect, useRef, useState } from 'react';
import { obtenerCategoriaPorClave } from '@/lib/anexosCatalogo';
import { useParams, useRouter } from 'next/navigation';
import NavbarWithBreadcrumb from '@/components/NavbarBreadcrumb';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileSpreadsheet, Trash2 } from 'lucide-react';
import VisualizadorDatos from '@/components/visualizadorDatos'; // Lo crearemos
import { crearReporteAnexo, FORMATO_REPORTE_ANEXO, type PdfMeta } from '@/lib/exports/pdf';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Tipo del anexo basado en tu backend

export interface Anexo {
  id: number;
  clave: string;
  categoria: string;
  creador_id: number;
  fecha_creacion: string;
  creado_en: string;
  actualizado_en: string;
  estado: string;
  acta_id?: number | null;
  unidad_responsable_id: number;
  datos: Array<Record<string, any>> | Record<string, any> | null;
  is_deleted: boolean;
  unidad_responsable_nombre: string;
  unidad_padre_id?: number | null;
  unidad_padre_nombre?: string | null;
  creador_nombre: string;
  creador?: { username?: string | null } | null;
  fojas_reporte?: number | null;
  reporte_generado_en?: string | null;
  reporte_vigente?: boolean;
  reporte_revision_actual: string;
  reporte_formato_actual: string;
}

type PieReporte = Pick<PdfMeta, "fechaElaboracion" | "elaboro" | "superviso" | "entrego">;

const filasAnexo = (anexo: Anexo) => Array.isArray(anexo.datos) ? anexo.datos : anexo.datos ? [anexo.datos] : [];
const metaReporte = (anexo: Anexo, pie: PieReporte): PdfMeta => ({
  ...pie,
  dependenciaClave: String(anexo.unidad_responsable_id), dependenciaNombre: anexo.unidad_responsable_nombre || "",
  urClave: anexo.unidad_padre_id ? String(anexo.unidad_padre_id) : "", urNombre: anexo.unidad_padre_nombre || "",
  categoriaNombre: obtenerCategoriaPorClave(anexo.clave) || anexo.categoria,
  claveAnexo: anexo.clave, infoActualizadaAl: anexo.actualizado_en || anexo.creado_en || anexo.fecha_creacion,
  revisionDatos: anexo.reporte_revision_actual,
});

async function consultarAnexo(id: string | number) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Inicia sesión nuevamente para consultar el anexo.");
  const response = await fetch(`${API_URL}/anexos/${id}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 401 ? "Tu sesión venció. Inicia sesión nuevamente." : "No se pudo consultar el anexo.");
  const data: Anexo = await response.json();
  return { ...data, categoria: obtenerCategoriaPorClave(data.clave) || data.categoria || "" };
}

const AnexoDetail: React.FC = () => {
  const params = useParams();
  const { id } = params as { id: string };
  const router = useRouter();
  const [anexo, setAnexo] = useState<Anexo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [modalPdf, setModalPdf] = useState(false);
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const excelEnCurso = useRef(false);
  const [fojasEstimadas, setFojasEstimadas] = useState<number | null>(null);
  const [calculandoFojas, setCalculandoFojas] = useState(false);
  const [generandoReporte, setGenerandoReporte] = useState(false);
  const reporteEnCurso = useRef(false);

  const [pdfFooter, setPdfFooter] = useState({
    fechaElaboracion: new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Mexico_City" }).format(new Date()),
    elaboro: "",
    superviso: "",
    entrego: "",
  });

  // Obtener usuario desde localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser({
          id: user.id.toString(),
          username: user.username,
          role: user.role,
        });
      } catch (e) {
        console.error("Error parsing user data");
      }
    }
  }, []);

  const fetchAnexo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push('/auth/login');
        return;
      }

      setRefreshing(true);
      const response = await fetch(`${API_URL}/anexos/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Anexo no encontrado");
        }
        if (response.status === 401) {
          throw new Error("Sesión expirada, por favor inicia sesión nuevamente");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: Anexo = await response.json();
      setAnexo({ ...data, categoria: obtenerCategoriaPorClave(data.clave) || data.categoria || "" });
      setPdfFooter(pie => ({ ...pie, elaboro: data.creador_nombre || data.creador?.username || "" }));
    } catch (error) {
      console.error("Error:", error);
      toast.error((error as Error).message);
      if ((error as Error).message.includes("Sesión expirada")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push('/auth/login');
      } else {
        router.back(); // Volver a la lista
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnexo();
  }, [id]);

  useEffect(() => {
    let activo = true;
    setFojasEstimadas(null);
    if (!anexo) return;
    setCalculandoFojas(true);
    const timer = window.setTimeout(() => {
      void crearReporteAnexo(anexo.clave, metaReporte(anexo, pdfFooter), filasAnexo(anexo), { incluirLogos: false })
        .then(({ fojas }) => { if (activo) setFojasEstimadas(fojas); })
        .catch(() => { if (activo) setFojasEstimadas(null); })
        .finally(() => { if (activo) setCalculandoFojas(false); });
    }, 200);
    return () => { activo = false; window.clearTimeout(timer); };
  }, [anexo, pdfFooter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Cargando anexo...</p>
      </div>
    );
  }

  if (!anexo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Anexo no encontrado</p>
      </div>
    );
  }

  // Asegurarnos de que filas sea un array para el PDF
  const filas = filasAnexo(anexo);


  // Función para manejar la descarga del PDF
  const onDownloadPdf = async () => {
    setModalPdf(true);

  };

  const onDownloadExcel = async () => {
    if (excelEnCurso.current) return;
    excelEnCurso.current = true;
    setExportandoExcel(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Inicia sesión nuevamente para descargar el anexo.");
      const response = await fetch(`${API_URL}/anexos/${anexo.id}`, {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error("Tu sesión venció. Inicia sesión nuevamente.");
        throw new Error("No se pudieron consultar los datos guardados del anexo.");
      }
      const guardado: Anexo = await response.json();
      const { exportAnexoToExcel } = await import("@/lib/exports/excel");
      exportAnexoToExcel(guardado);
      toast.success("Excel descargado con clave y sello de fecha de descarga");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar el anexo a Excel.");
    } finally {
      excelEnCurso.current = false;
      setExportandoExcel(false);
    }
  };

  const onGenerarReporte = async () => {
    if (reporteEnCurso.current) return;
    reporteEnCurso.current = true; setGenerandoReporte(true);
    try {
      const guardado = await consultarAnexo(anexo.id);
      if (!guardado.reporte_revision_actual || guardado.reporte_formato_actual !== FORMATO_REPORTE_ANEXO) {
        throw new Error("Actualiza la aplicación para generar el reporte con el formato vigente.");
      }
      const { doc, fojas } = await crearReporteAnexo(guardado.clave, metaReporte(guardado, pdfFooter), filasAnexo(guardado));
      const formulario = new FormData();
      formulario.append("file", doc.output("blob"), `Reporte_${guardado.clave}.pdf`);
      formulario.append("revision", guardado.reporte_revision_actual);
      formulario.append("formato", FORMATO_REPORTE_ANEXO);
      const response = await fetch(`${API_URL}/anexos/${guardado.id}/reporte`, {
        method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: formulario,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (response.status === 409) setAnexo(await consultarAnexo(anexo.id));
        throw new Error(typeof error.detail === "string" ? error.detail : "No se pudieron confirmar las fojas del reporte.");
      }
      const confirmado: Anexo = await response.json();
      if (confirmado.fojas_reporte !== fojas) throw new Error("El conteo de fojas del reporte no coincide. Genera el reporte nuevamente.");
      setAnexo({ ...confirmado, categoria: obtenerCategoriaPorClave(confirmado.clave) || confirmado.categoria || "" });
      doc.save(`Reporte_${guardado.clave.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`);
      setModalPdf(false);
      toast.success(`Reporte generado: ${fojas} foja(s) confirmadas`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo generar el reporte.");
    } finally { reporteEnCurso.current = false; setGenerandoReporte(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <NavbarWithBreadcrumb
        user={currentUser?.username || null}
        role={currentUser?.role || ""}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Detalle del Anexo</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={
                onDownloadPdf
              }
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Generar reporte
            </Button>
            <Button
              size="sm"
              onClick={() => void onDownloadExcel()}
              disabled={exportandoExcel}
              className="gap-2 bg-[#107C41] text-white hover:bg-[#0c6032]"
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
              {exportandoExcel ? "Exportando..." : "Exportar Excel"}
            </Button>


          </div>
        </div>
        <Dialog open={modalPdf} onOpenChange={open => { if (!reporteEnCurso.current) setModalPdf(open); }}>
          <DialogContent>

            <DialogTitle>Generar reporte del anexo {anexo.clave}</DialogTitle>

            <div className="my-4 p-4 bg-yellow-100 text-yellow-800 rounded grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Elaboró</Label>
                <Input
                  placeholder="Elaboró"
                  value={pdfFooter.elaboro}
                  onChange={(e) =>
                    setPdfFooter({ ...pdfFooter, elaboro: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Supervisó</Label>
                <Input
                  placeholder="Supervisó"
                  value={pdfFooter.superviso}
                  onChange={(e) =>
                    setPdfFooter({ ...pdfFooter, superviso: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Entregó</Label>
                <Input
                  placeholder="Entregó"
                  value={pdfFooter.entrego}
                  onChange={(e) =>
                    setPdfFooter({ ...pdfFooter, entrego: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" disabled={generandoReporte} onClick={() => setModalPdf(false)}>
                Cancelar
              </Button>

              <Button onClick={() => void onGenerarReporte()} disabled={generandoReporte}>
                {generandoReporte ? "Generando reporte..." : "Generar reporte"}
              </Button>
            </div>

          </DialogContent>
        </Dialog>

        {/* Información general */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Anexo</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Clave:</strong> {anexo.clave}
            </div>
            <div>
              <strong>Categoría:</strong> {anexo.categoria}
            </div>
            <div>
              <strong>Estado:</strong>{' '}
              <span
                className={`px-2 py-1 rounded-full text-xs ${anexo.estado === 'Completado'
                  ? 'bg-green-100 text-green-800'
                  : anexo.estado === 'Borrador'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                  }`}
              >
                {anexo.estado}
              </span>
            </div>
            <div>
              <strong>Fecha de Creación:</strong> {new Date(anexo.fecha_creacion).toLocaleDateString()}
            </div>
            <div>
              <strong>Unidad Responsable:</strong> {anexo.unidad_responsable_nombre || "No disponible"}
            </div>
            <div><strong>Creador:</strong> {anexo.creador_nombre || anexo.creador?.username || "No disponible"}</div>
            <div><strong>Registros:</strong> {filas.length}</div>
            <div><strong>Fojas estimadas:</strong> {calculandoFojas ? "Calculando..." : fojasEstimadas === null ? "No disponibles" : `Aproximadamente ${fojasEstimadas}`}</div>
            <div><strong>Fojas del reporte:</strong> {anexo.reporte_vigente ? `${anexo.fojas_reporte} confirmadas` : anexo.fojas_reporte ? "Pendiente de regenerar" : "Pendiente de generar"}</div>
            {anexo.reporte_vigente && anexo.reporte_generado_en && <div><strong>Reporte generado el:</strong> {new Date(anexo.reporte_generado_en).toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}</div>}
            <div>
              <strong>Actualizado el:</strong> {new Date(anexo.actualizado_en).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Visualización de datos */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Anexo</CardTitle>
          </CardHeader>
          <CardContent>
            <VisualizadorDatos datos={anexo.datos} clave={anexo.clave} />
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
          {anexo.estado === "Borrador" && anexo.acta_id == null &&
            (currentUser?.role === "ADMIN" ||
              (Number(currentUser?.id) > 0 && Number(anexo.creador_id) === Number(currentUser?.id))) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("¿Estás seguro de eliminar este anexo?")) {
                  // Aquí iría la llamada DELETE
                  toast.success("Anexo eliminado");
                  router.push("/dashboard/anexos");
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnexoDetail;
