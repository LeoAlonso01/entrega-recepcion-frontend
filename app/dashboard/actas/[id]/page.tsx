"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb";
import { toast } from "sonner";
import { ArrowLeft, FileText, Calendar, Clock, User } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ActaDetail {
  id: number;
  unidad_responsable: number;
  folio: string;
  fecha: string;
  hora: string;
  comisionado: string;
  oficio_comision: string | null;
  fecha_oficio_comision: string | null;
  entrante: string;
  ine_entrante: string | null;
  fecha_inicio_labores: string | null;
  nombramiento: string | null;
  fecha_nombramiento: string | null;
  asignacion: string | null;
  asignado_por: string | null;
  domicilio_entrante: string | null;
  telefono_entrante: string | null;
  saliente: string;
  fecha_fin_labores: string | null;
  testigo_entrante: string | null;
  ine_testigo_entrante: string | null;
  testigo_saliente: string | null;
  ine_testigo_saliente: string | null;
  fecha_cierre_acta: string | null;
  hora_cierre_acta: string | null;
  observaciones: string | null;
  estado: "Pendiente" | "Completada" | "Revisión";
  creado_en: string;
  actualizado_en: string;
}

export default function ActaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const [acta, setActa] = useState<ActaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);

  // Obtener usuario desde localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser({
          username: user.username,
          role: user.role,
        });
      } catch (e) {
        console.error("Error parsing user data");
      }
    }
  }, []);

  // Cargar detalles de la acta
  useEffect(() => {
    const fetchActa = async () => {
      try {
        const response = await fetch(`${API_URL}/actas/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Acta no encontrada");
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setActa(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error((error as Error).message);
        router.push("/dashboard/actas");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchActa();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Cargando detalles de la acta...</p>
      </div>
    );
  }

  if (!acta) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>No se pudo cargar la información de la acta.</p>
      </div>
    );
  }

  // Formatear fechas
  const formatDate = (dateStr?: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString("es-MX") : "-";

  const formatDateTime = (dateStr?: string | null) =>
    dateStr ? new Date(dateStr).toLocaleString("es-MX") : "-";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <NavbarWithBreadcrumb
        user={currentUser?.username || null}
        role={currentUser?.role || ""}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Encabezado */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Acta #{acta.id}</h1>
            <p className="text-gray-600">Folio: <strong>{acta.folio}</strong></p>
          </div>
          <Badge
            className={
              acta.estado === "Completada"
                ? "bg-green-100 text-green-800"
                : acta.estado === "Revisión"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }
          >
            {acta.estado}
          </Badge>
        </div>

        {/* Botón de regreso */}
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        {/* Sección: Datos Generales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Datos Generales
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Folio:</strong> {acta.folio}
            </div>
            <div>
              <strong>Unidad Responsable ID:</strong> {acta.unidad_responsable}
            </div>
            <div>
              <strong>Fecha:</strong> {formatDate(acta.fecha)}
            </div>
            <div>
              <strong>Hora:</strong> {acta.hora || "-"}
            </div>
            <div>
              <strong>Estado:</strong>{" "}
              <Badge
                variant="secondary"
                className={
                  acta.estado === "Completada"
                    ? "bg-green-100 text-green-800"
                    : acta.estado === "Revisión"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {acta.estado}
              </Badge>
            </div>
            <div>
              <strong>Comisionado:</strong> {acta.comisionado}
            </div>
          </CardContent>
        </Card>

        {/* Funcionario Entrante */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionario Entrante</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Nombre:</strong> {acta.entrante}
            </div>
            <div>
              <strong>INE:</strong> {acta.ine_entrante || "-"}
            </div>
            <div>
              <strong>Fecha inicio labores:</strong> {formatDate(acta.fecha_inicio_labores)}
            </div>
            <div>
              <strong>Nombramiento:</strong> {acta.nombramiento || "-"}
            </div>
            <div>
              <strong>Asignación:</strong> {acta.asignacion || "-"}
            </div>
            <div>
              <strong>Asignado por:</strong> {acta.asignado_por || "-"}
            </div>
            <div>
              <strong>Domicilio:</strong> {acta.domicilio_entrante || "-"}
            </div>
            <div>
              <strong>Teléfono:</strong> {acta.telefono_entrante || "-"}
            </div>
          </CardContent>
        </Card>

        {/* Funcionario Saliente */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionario Saliente</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Nombre:</strong> {acta.saliente}
            </div>
            <div>
              <strong>Fecha fin labores:</strong> {formatDate(acta.fecha_fin_labores)}
            </div>
          </CardContent>
        </Card>

        {/* Testigos */}
        <Card>
          <CardHeader>
            <CardTitle>Testigos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Entrante:</strong> {acta.testigo_entrante || "-"}
            </div>
            <div>
              <strong>INE:</strong> {acta.ine_testigo_entrante || "-"}
            </div>
            <div>
              <strong>Saliente:</strong> {acta.testigo_saliente || "-"}
            </div>
            <div>
              <strong>INE:</strong> {acta.ine_testigo_saliente || "-"}
            </div>
          </CardContent>
        </Card>

        {/* Cierre del Acta */}
        <Card>
          <CardHeader>
            <CardTitle>Cierre del Acta</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Fecha cierre:</strong> {formatDate(acta.fecha_cierre_acta)}
            </div>
            <div>
              <strong>Hora cierre:</strong> {acta.hora_cierre_acta || "-"}
            </div>
            <div className="md:col-span-2">
              <strong>Observaciones:</strong>
              <p className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 min-h-[80px] whitespace-pre-wrap">
                {acta.observaciones || "No hay observaciones."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metadatos */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Creado el: {formatDateTime(acta.creado_en)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Actualizado: {formatDateTime(acta.actualizado_en)}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}