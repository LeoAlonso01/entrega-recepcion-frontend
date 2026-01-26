"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Edit, Trash2, Eye, ExternalLink } from "lucide-react";
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

interface Anexo {
    id: number;
    clave: string;
    creador_id?: number;
    datos?: any[];
    estado?: string;
    unidad_responsable_id?: number;
    fecha_creacion?: string;
    acta_id?: number;
    creado_en?: string;
    actualizado_en?: string;
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
    anexos?: Anexo[];
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

    // Estados y funciones para paginación, preview y descarga de anexos
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [downloadLoadingId, setDownloadLoadingId] = useState<number | null>(null);

    // Valores derivados para evitar errores de "posiblemente undefined"
    const totalAnexos = acta?.anexos?.length || 0;
    const totalPages = Math.max(1, Math.ceil(totalAnexos / pageSize));

    const getAnexoUrls = (anexo: Anexo) => {
        if (!anexo?.datos) return [] as string[];
        const urls = new Set<string>();
        try {
            anexo.datos.forEach(d => {
                const s = JSON.stringify(d);
                const matches = s.match(/https?:\/\/[^\s"'}]+/g);
                if (matches) matches.forEach(m => urls.add(m));
            });
        } catch (e) {
            console.error(e);
        }
        return Array.from(urls);
    };

    const handlePreview = (url: string) => {
        setPreviewLoading(true);
        setPreviewUrl(url);
        setPreviewOpen(true);
    };

    const handleIframeLoad = () => {
        setPreviewLoading(false);
    };

    const handleIframeError = () => {
        setPreviewLoading(false);
        toast.error("No se pudo cargar el documento para vista previa");
        setPreviewOpen(false);
        setPreviewUrl(null);
    };

    const handleDownload = async (url: string, anexoId?: number) => {
        setDownloadLoadingId(anexoId ?? null);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error al descargar");
            const blob = await res.blob();
            const filename = url.split("/").pop() || "document";
            const href = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = href;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(href);
            toast.success("Descarga iniciada");
        } catch (e) {
            console.error(e);
            toast.error("Error al descargar el documento");
        } finally {
            setDownloadLoadingId(null);
        }
    };

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
                    <CardFooter className="flex flex-col items-start space-y-4">
                        <CardTitle className="text-lg font-semibold">Anexos</CardTitle>

                        {acta.anexos && acta.anexos.length > 0 ? (
                            <>
                                {/* Paginación y controles */}
                                <div className="flex items-center justify-between mb-3 w-full">
                                    <div className="text-sm text-gray-600">Mostrando {Math.min((currentPage - 1) * pageSize + 1, acta.anexos.length)} - {Math.min(currentPage * pageSize, acta.anexos.length)} de {acta.anexos.length}</div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm text-gray-600">Filas</label>
                                        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="text-sm border rounded px-2 py-1 bg-white">
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</Button>
                                            <div className="text-sm text-gray-700">{currentPage} / {Math.max(1, Math.ceil(acta.anexos.length / pageSize))}</div>
                                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Siguiente</Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabla de anexos */}
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full text-sm table-auto border-collapse">
                                        <thead>
                                            <tr className="text-left text-xs text-gray-500 border-b">
                                                <th className="py-2">Clave</th>
                                                <th className="py-2">Estado</th>
                                                <th className="py-2">Fecha</th>
                                                <th className="py-2">Filas</th>
                                                <th className="py-2">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {acta.anexos.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((anexo: any) => {
                                                const urls = getAnexoUrls(anexo as Anexo);
                                                return (
                                                    <tr key={anexo.id} className="border-b last:border-b-0">
                                                        <td className="py-2 align-top">
                                                            <div className="font-medium">{anexo.clave}</div>
                                                            <div className="text-xs text-gray-500">#{anexo.id}</div>
                                                        </td>
                                                        <td className="py-2 align-top">{anexo.estado || '–'}</td>
                                                        <td className="py-2 align-top">{formatDate(anexo.fecha_creacion)}</td>
                                                        <td className="py-2 align-top">{(anexo.datos && anexo.datos.length) || 0}</td>
                                                        <td className="py-2 align-top">
                                                            <div className="flex items-center gap-2">
                                                                {/* Si hay URLs disponibles mostrar acciones */}
                                                                {urls.length > 0 ? (
                                                                    <>
                                                                        {urls.length === 1 ? (
                                                                            <>
                                                                                <Button variant="ghost" size="sm" onClick={() => handlePreview(urls[0])} className="flex items-center gap-2">
                                                                                    <Eye className="h-4 w-4" />
                                                                                    <span className="sr-only">Vista previa</span>
                                                                                </Button>
                                                                                <Button variant="outline" size="sm" onClick={() => handleDownload(urls[0], anexo.id)} disabled={downloadLoadingId === anexo.id}>
                                                                                    {downloadLoadingId === anexo.id ? <Download className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                                                                </Button>
                                                                                <a href={urls[0]} target="_blank" rel="noreferrer" className="text-sm text-blue-600 flex items-center gap-1"><ExternalLink className="h-4 w-4"/> Abrir</a>
                                                                            </>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2">
                                                                                {/* Dropdown con varias URLs */}
                                                                                <div className="relative inline-block text-left">
                                                                                    <div className="flex gap-1">
                                                                                        <Button variant="ghost" size="sm">Acciones</Button>
                                                                                        <div className="bg-white border rounded-md shadow-md p-2 absolute right-0 mt-2 z-10">
                                                                                            {urls.map((u: string, i: number) => (
                                                                                                <div key={u} className="flex items-center gap-2 mb-1">
                                                                                                    <button className="text-sm text-gray-700 hover:text-gray-900" onClick={() => handlePreview(u)}><Eye className="h-4 w-4 inline mr-1"/> Vista previa {i + 1}</button>
                                                                                                    <button className="text-sm text-gray-700 hover:text-gray-900" onClick={() => handleDownload(u, anexo.id)}>{downloadLoadingId === anexo.id ? <Download className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4"/>} Descargar</button>
                                                                                                    <a className="text-sm text-blue-600 flex items-center gap-1" href={u} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4"/> Abrir</a>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <span className="text-xs text-gray-500">Sin archivos</span>
                                                                )}
                                                            </div>
                                                            {/* Enlace a la vista de detalle del anexo (JSON o formulario) */}
                                                            <div className="ml-2">
                                                                <Link href={`/dashboard/anexos/${anexo.id}`} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                                                    <ExternalLink className="h-4 w-4" />
                                                                    <span>Ver anexo</span>
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Dialog para vista previa */}
                                <Dialog open={previewOpen} onOpenChange={(open) => { if (!open) { setPreviewUrl(null); setPreviewOpen(false); } }}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Vista previa del documento</DialogTitle>
                                            <DialogDescription>{previewUrl}</DialogDescription>
                                        </DialogHeader>
                                        <div className="h-[70vh] w-full bg-white">
                                            {previewLoading && (
                                                <div className="flex items-center justify-center h-full">
                                                    <Download className="h-6 w-6 animate-spin text-gray-500" />
                                                </div>
                                            )}
                                            {previewUrl && (
                                                // iframe puede fallar por CORS, se maneja en onError
                                                <iframe src={previewUrl} className="w-full h-full border" onLoad={handleIframeLoad} onError={handleIframeError} />
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </>
                        ) : (
                            <p className="text-sm text-gray-700">No hay anexos disponibles para este acta.</p>
                        )}

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