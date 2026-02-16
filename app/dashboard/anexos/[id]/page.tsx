"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavbarWithBreadcrumb from '@/components/NavbarBreadcrumb';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Trash2 } from 'lucide-react';
import VisualizadorDatos from '@/components/visualizadorDatos'; // Lo crearemos
import { exportAnexoToExcel, exportAnexoToPDF } from '@/lib/exports';
import { generarAnexoPdf, type PdfMeta } from  '@/lib/exports/pdf';

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
  unidad_responsable_id: number;
  datos: Array<Record<string, any>> | Record<string, any> | null;
  is_deleted: boolean;
}

const AnexoDetail: React.FC = () => {
  const params = useParams();
  const { id } = params as { id: string };
  const router = useRouter();

  const [anexo, setAnexo] = useState<Anexo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; role: string } | null>(null);

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
          // Authorization: `Bearer ${token}`,
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
      setAnexo(data);
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

  const onDownloadPdf = () => {
    const filas = Array.isArray(anexo?.datos) ? anexo.datos : [];
    const meta: PdfMeta = {
      fechaElaboracion: anexo.fecha_creacion,
    };
    generarAnexoPdf(anexo.clave, meta, filas);
    toast.success("PDF generado correctamente");
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
              onClick={onDownloadPdf}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Funcionalidad en desarrollo")}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

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
              <strong>Unidad Responsable ID:</strong> {anexo.unidad_responsable_id}
            </div>
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
          {currentUser?.role === "ADMIN" && (
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