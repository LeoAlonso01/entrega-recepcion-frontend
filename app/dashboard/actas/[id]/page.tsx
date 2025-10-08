"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Edit, Trash2 } from "lucide-react";
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { generarActa } from "@/lib/generarActa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Unidad {
    id_unidad: number;
    nombre: string;
    descripcion?: string;
}

interface ActaForm {
    id: number;
    unidad_responsable: number;
    folio?: string;
    fecha: string;
    hora: string;
    comisionado?: string;
    oficio_comision?: string;
    fecha_oficio_comision?: string;
    entrante: string;
    ine_entrante?: string;
    fecha_inicio_labores?: string;
    nombramiento?: string;
    fecha_nombramiento?: string;
    asignacion?: string;
    asignado_por?: string;
    domicilio_entrante?: string;
    telefono_entrante?: string;
    saliente: string;
    fecha_fin_labores?: string;
    testigo_entrante?: string;
    ine_testigo_entrante?: string;
    testigo_saliente?: string;
    ine_testigo_saliente?: string;
    fecha_cierre_acta?: string;
    hora_cierre_acta?: string;
    observaciones?: string;
    estado: "Pendiente" | "Completada" | "Revisión";
    creado_en?: string;
    actualizado_en?: string;
}

// Formatear fecha legible
const formatDate = (dateStr?: string) => {
    if (!dateStr) return "–";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "–" : date.toLocaleDateString("es-MX");
};

// Formatear hora
const formatTime = (timeStr?: string) => {
    if (!timeStr) return "–";
    return timeStr.slice(0, 5); // HH:mm
};

// Obtener nombre de unidad
const getUnidadNombre = (unidades: Unidad[], id?: number) => {
    if (!id) return "–";
    const unidad = unidades.find(u => u.id_unidad === id);
    return unidad ? unidad.nombre : `Unidad ${id}`;
};

export default function ViewActaPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [acta, setActa] = useState<ActaForm | null>(null);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const actaId = parseInt(params.id, 10);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Obtener unidades
                const unidadesRes = await fetch(`${API_URL}/unidades_responsables`, {
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!unidadesRes.ok) throw new Error('Error cargando unidades');
                const unidadesData = await unidadesRes.json();
                setUnidades(unidadesData);

                // Obtener acta específica
                const actaRes = await fetch(`${API_URL}/actas/${actaId}`, {
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!actaRes.ok) {
                    if (actaRes.status === 404) {
                        toast.error("Acta no encontrada");
                        router.push("/actas");
                        return;
                    }
                    throw new Error('Error al cargar el acta');
                }
                const actaData = await actaRes.json();
                setActa(actaData);
            } catch (error) {
                console.error(error);
                toast.error("No se pudo cargar el acta");
                router.push("/actas");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [actaId, router]);

    useEffect(() => {
        document.title = acta ? `Acta ${acta.folio || acta.id}` : "Cargando Acta...";
    }, [acta]);

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No autorizado");

            const response = await fetch(`${API_URL}/actas/${actaId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Error al eliminar");

            toast.success("Acta eliminada correctamente");
            router.push("/actas");
        } catch (error) {
            console.error(error);
            toast.error("No se pudo eliminar el acta");
        }
    };

    const handleCreateActa = () => {
        
        // Aquí podrías implementar la lógica para generar el PDF del acta
        // o redirigir a otra página que maneje esa funcionalidad.
        // generarActa(acta);
        toast.success("Generando PDF del acta...");

        const unidad = unidades.find(u => u.id_unidad === acta?.unidad_responsable);
        if (!unidad) return toast.error("No se encontró la unidad responsable");

        const anexos = []; // Aquí podrías agregar la lógica para manejar anexos si es necesario
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavbarWithBreadcrumb role="ADMIN" />
                <main className="max-w-4xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    if (!acta) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <NavbarWithBreadcrumb role="ADMIN" />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Encabezado */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Regresar
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Acta #{acta.folio || acta.id}</h1>
                    <Badge
                        className={
                            acta.estado === "Completada"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : acta.estado === "Pendiente"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                        }
                    >
                        {acta.estado}
                    </Badge>
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3 mb-6">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/actas/${acta.id}/edit`)}
                        className="flex items-center gap-2"
                    >
                        <Edit className="h-4 w-4" />
                        Editar
                    </Button>
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el acta con folio{" "}
                                    <strong>{acta.folio || `#${acta.id}`}</strong>.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                                    Sí, eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="secondary" onClick={() => handleCreateActa()} className="flex items-center">
                        <Download className="h-4 w-4 ml-2" />
                        Generar PDF
                    </Button>
                </div>

                {/* Sección: Información General */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Datos Generales</CardTitle>
                        <CardDescription>Información principal del acta</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Folio</label>
                                <p className="mt-1">{acta.folio || "–"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fecha</label>
                                <p className="mt-1">{formatDate(acta.fecha)} a las {formatTime(acta.hora)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Unidad Responsable</label>
                                <p className="mt-1">{getUnidadNombre(unidades, acta.unidad_responsable)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sección: Comisionado */}
                {(acta.comisionado || acta.oficio_comision || acta.fecha_oficio_comision) && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Comisionado</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Nombre</label>
                                    <p className="mt-1">{acta.comisionado || "–"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Oficio de Comisión</label>
                                    <p className="mt-1">{acta.oficio_comision || "–"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Fecha del Oficio</label>
                                    <p className="mt-1">{formatDate(acta.fecha_oficio_comision)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sección: Funcionario Entrante */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Funcionario Entrante</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nombre</label>
                                <p className="mt-1">{acta.entrante}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">INE</label>
                                <p className="mt-1">{acta.ine_entrante || "–"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Inicio de Labores</label>
                                <p className="mt-1">{formatDate(acta.fecha_inicio_labores)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nombramiento</label>
                                <p className="mt-1">{acta.nombramiento || "–"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fecha Nombramiento</label>
                                <p className="mt-1">{formatDate(acta.fecha_nombramiento)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Tipo de Asignación</label>
                                <p className="mt-1 capitalize">{acta.asignacion || "–"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Asignado por</label>
                                <p className="mt-1 capitalize">{acta.asignado_por?.replace("_", " ") || "–"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Domicilio</label>
                                <p className="mt-1">{acta.domicilio_entrante || "–"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                                <p className="mt-1">{acta.telefono_entrante || "–"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sección: Funcionario Saliente */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Funcionario Saliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nombre</label>
                                <p className="mt-1">{acta.saliente}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fin de Labores</label>
                                <p className="mt-1">{formatDate(acta.fecha_fin_labores)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sección: Testigos */}
                {(acta.testigo_entrante || acta.testigo_saliente) && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Testigos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Testigo Entrante</label>
                                    <p className="mt-1">{acta.testigo_entrante || "–"}</p>
                                    {acta.ine_testigo_entrante && (
                                        <>
                                            <label className="text-sm font-medium text-gray-500 mt-2 block">INE</label>
                                            <p className="mt-1">{acta.ine_testigo_entrante}</p>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Testigo Saliente</label>
                                    <p className="mt-1">{acta.testigo_saliente || "–"}</p>
                                    {acta.ine_testigo_saliente && (
                                        <>
                                            <label className="text-sm font-medium text-gray-500 mt-2 block">INE</label>
                                            <p className="mt-1">{acta.ine_testigo_saliente}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sección: Cierre del Acta */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cierre del Acta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fecha de Cierre</label>
                                <p className="mt-1">{formatDate(acta.fecha_cierre_acta)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Hora de Cierre</label>
                                <p className="mt-1">{formatTime(acta.hora_cierre_acta)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Observaciones</label>
                                <p className="mt-1 whitespace-pre-line">{acta.observaciones || "–"}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start space-y-2">
                        <CardTitle className="text-lg font-semibold">Anexos</CardTitle>

                        <p className="text-sm text-gray-700">
                            No hay anexos disponibles para este acta.
                        </p>

                        <CardDescription className="text-xs text-gray-500">
                            Los campos con <span className="font-medium">"–"</span> indican que no se proporcionó información.
                        </CardDescription>
                    </CardFooter>


                </Card>

                {/* Información adicional opcional */}
                <div className="mt-6 text-sm text-gray-500">
                    Creado: {formatDate(acta.creado_en)} • Actualizado: {formatDate(acta.actualizado_en)}
                </div>
            </main>
        </div>
    );
}