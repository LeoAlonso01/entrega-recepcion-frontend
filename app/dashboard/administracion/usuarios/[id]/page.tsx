// app/dashboard/administracion/usuarios/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import ResetPasswordModal from '@/components/ResetPasswordModal';
import { ArrowLeft, User, Mail, Shield, Check, X, Calendar, Hash, Lock, RefreshCw, Building2 } from 'lucide-react';
import Link from 'next/link';
import NavbarWithBreadcrumb from '../../../../../components/NavbarBreadcrumb';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { get } from 'http';
import { parse } from 'path';
import { set } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Default to local if not set

type UnidadResponsableSimple = {
    id_unidad: number;
    nombre: string;
}

type Cargo = {
    id: number;
    nombre: string;
    descripcion: string;
    activo?: boolean;
    creado_en?: string;
    actualizado_en?: string;
    is_deleted?: boolean;
}

type CargoActual = {
    id: number;
    cargo_id: number;
    user_id: number;
    unidad_responsable_id: number;
    fecha_inicio: string;
    fecha_fin: string | null;
    motivo: string;
    is_deleted?: boolean;
    cargo?: Cargo;
}

interface Usuario {
    id: number;
    username: string;
    email: string;
    role: string;
    is_deleted: boolean;

    created_at: string;
    updated_at: string;

    reset_token?: string | null;
    reset_token_expiration?: string | null;

    unidad_responsable?: UnidadResponsableSimple | null;

    cargos_actuales?: CargoActual[];
    cargos_historial?: CargoActual[];
    cargos_asignados?: CargoActual[];
}

export default function UsuarioDetallePage() {
    const { id } = useParams();
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ username: string; role: string }>({ username: "", role: "" })

    // Password change/reset states
    const [currentPasswordInput, setCurrentPasswordInput] = useState("");
    const [newPasswordInput, setNewPasswordInput] = useState("");
    const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    // Modal states for password workflows
    const [openSelfChange, setOpenSelfChange] = useState(false);
    const [openAdminReset, setOpenAdminReset] = useState(false);
    const [resetTarget, setResetTarget] = useState<{ id: number; username: string } | null>(null);

    // Modal / asignación de cargo
    const [openCargoModal, setOpenCargoModal] = useState(false);
    const [cargosDisponibles, setCargosDisponibles] = useState<{ id: number; nombre: string }[]>([]);
    const [cargosLoading, setCargosLoading] = useState(false);
    const [selectedCargoId, setSelectedCargoId] = useState<string>("");
    const [motivoCargo, setMotivoCargo] = useState("Asignación desde panel de administración");
    const [assigningCargo, setAssigningCargo] = useState(false);

    // cargo mas actual
    const cargoActual = (usuario?.cargos_actuales ?? [])
        .filter((c) => !c.fecha_fin && !c.is_deleted)
        .sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime())[0];

    const fetchUsuario = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push('/login');
                return;
            }

            setRefreshing(true);
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Usuario no encontrado");
                }
                if (response.status === 401) {
                    throw new Error("Sesión expirada, por favor inicia sesión nuevamente");
                }
                if (response.status === 500) {
                    const text = await response.text().catch(() => "");
                    throw new Error(`Error interno del servidor: ${text || response.statusText}`);
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setUsuario(data);
        } catch (error) {
            console.error("Error:", error);
            toast.error((error as Error).message);
            if ((error as Error).message.includes("Sesión expirada")) {
                localStorage.removeItem("token");
                router.push('/auth/login');
            } else {
                // we don't have a dedicated `/administracion/usuarios` page,
                // the listing lives at `/dashboard/administracion`, so jump there
                router.push('/dashboard/administracion');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // el token existe
        const token = localStorage.getItem("token");
        if (!token) {
            router.push('/login');
            return;
        }
        // leer usuario actual almacenado (si existe) para decisiones de UI (si es admin o el mismo usuario)
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                setCurrentUser(JSON.parse(stored));
            } catch (e) {
                console.warn('No se pudo parsear currentUser', e);
            }
        }
        fetchUsuario();
    }, [id]);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPasswordInput || newPasswordInput !== confirmPasswordInput) {
            toast.error('Las contraseñas no coinciden o están vacías');
            return;
        }
        setIsChangingPassword(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Token no encontrado. Inicia sesión de nuevo.');
                router.push('/login');
                return;
            }
            const res = await fetch(`${API_URL}/users/${id}/change_password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword: currentPasswordInput, newPassword: newPasswordInput }),
            });
            if (res.ok) {
                toast.success('Contraseña cambiada correctamente.');
                setCurrentPasswordInput('');
                setNewPasswordInput('');
                setConfirmPasswordInput('');
            } else if (res.status === 401) {
                toast.error('Credenciales inválidas.');
            } else {
                const err = await res.json().catch(() => null);
                toast.error(err?.message || 'Error al cambiar la contraseña');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error al cambiar la contraseña');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleAdminResetPassword = async () => {
        if (!confirm('¿Resetear la contraseña de este usuario a la contraseña universal?')) return;
        setIsResettingPassword(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Token no encontrado.');
                router.push('/login');
                return;
            }
            const universal = 'user123';
            const res = await fetch(`${API_URL}/admin/users/${id}/reset_password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ newPassword: universal }),
            });
            if (res.ok) {
                toast.success(`Contraseña reseteada a "${universal}"`);
                // copiar al portapapeles para conveniencia del admin
                try { await navigator.clipboard.writeText(universal); toast.success('Contraseña copiada al portapapeles'); } catch (e) { /* no-crash */ }
            } else if (res.status === 403) {
                toast.error('No tienes permisos para resetear la contraseña');
            } else {
                const err = await res.json().catch(() => null);
                toast.error(err?.message || 'Error al resetear la contraseña');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error al resetear la contraseña');
        } finally {
            setIsResettingPassword(false);
            // refrescar información de usuario rápidamente
            fetchUsuario();
        }
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleAddCargo = async () => {
        // Requisito: unidad responsable
        if (!usuario?.unidad_responsable?.id_unidad) {
            toast.error("Este usuario no tiene unidad responsable asignada. Asigna la unidad primero.");
            return;
        }

        setOpenCargoModal(true);

        // Cargar cargos solo si no están cargados
        if (cargosDisponibles.length > 0) return;

        setCargosLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token no encontrado. Inicia sesión de nuevo.");
                router.push("/");
                return;
            }

            const res = await fetch(`${API_URL}/cargos`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("No se pudieron cargar los cargos");

            const data = await res.json();
            setCargosDisponibles(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            toast.error("Error al cargar cargos");
        } finally {
            setCargosLoading(false);
        }
    };

    const handleConfirmAssignCargo = async () => {
        if (!usuario) return;

        const unidadId = usuario.unidad_responsable?.id_unidad;
        if (!unidadId) {
            toast.error("No hay unidad responsable para asignar el cargo.");
            return;
        }

        const cargoIdNum = parseInt(selectedCargoId, 10);
        if (!cargoIdNum) {
            toast.error("Selecciona un cargo.");
            return;
        }

        setAssigningCargo(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Token no encontrado. Inicia sesión de nuevo.");
                router.push("/");
                return;
            }

            const res = await fetch(`${API_URL}/cargos/asignar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cargo_id: cargoIdNum,
                    user_id: usuario.id,
                    unidad_responsable_id: unidadId,
                    motivo: motivoCargo || null,
                }),
            });

            if (res.status === 409) {
                const err = await res.json().catch(() => ({}));
                toast.error(err?.detail || "Ya existe una asignación activa para ese cargo y unidad.");
                return;
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast.error(err?.detail || "No se pudo asignar el cargo");
                return;
            }

            toast.success("Cargo asignado correctamente");
            setOpenCargoModal(false);
            setSelectedCargoId("");
            // refrescar usuario para que se pinte el cargo actual
            await fetchUsuario();
        } catch (e) {
            console.error(e);
            toast.error("Error al asignar cargo");
        } finally {
            setAssigningCargo(false);
        }
    };



    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!usuario) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumbs */}
                <NavbarWithBreadcrumb
                    user={currentUser?.username || null}
                    role={currentUser?.role || ""}
                />
                <div className="max-w-4xl mx-auto p-4">
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-500">No se pudo cargar la información del usuario</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumbs */}
            <NavbarWithBreadcrumb
                user={currentUser?.username || null}
                role={currentUser?.role || ""}
            />
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/dashboard/administracion/">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a usuarios
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        onClick={fetchUsuario}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <span>{usuario.username}</span>
                                </CardTitle>
                                <CardDescription className="mt-2 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{usuario.email}</span>
                                </CardDescription>
                            </div>
                            <Badge variant={usuario.is_deleted ? 'destructive' : 'default'}>
                                {usuario.is_deleted ? 'Eliminado' : 'Activo'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                            <DetailSection
                                title="Información Básica"
                                items={[
                                    {
                                        icon: <Hash className="h-5 w-5" />,
                                        title: "ID",
                                        value: usuario.id.toString()
                                    },
                                    {
                                        icon: <Shield className="h-5 w-5" />,
                                        title: "Rol",
                                        value: usuario.role,
                                        badge: (
                                            <Badge variant={usuario.role === 'ADMIN' ? 'default' : 'secondary'}>
                                                {usuario.role}
                                            </Badge>
                                        )
                                    }
                                ]}
                            />

                            <DetailSection
                                title="Estado"
                                items={[
                                    {
                                        icon: usuario.is_deleted ?
                                            <X className="h-5 w-5 text-red-600" /> :
                                            <Check className="h-5 w-5 text-green-600" />,
                                        title: "Cuenta",
                                        value: usuario.is_deleted ? 'Eliminada' : 'Activa'
                                    },
                                    {
                                        icon: <Lock className="h-5 w-5 text-amber-600" />,
                                        title: "Contraseña",
                                        value: "••••••••",
                                        hint: "Solo visible en el backend"
                                    }
                                ]}
                            />
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                            <DetailSection
                                title="Historial"
                                items={[
                                    {
                                        icon: <Calendar className="h-5 w-5" />,
                                        title: "Creado el",
                                        value: formatDate(usuario.created_at)
                                    },
                                    {
                                        icon: <RefreshCw className="h-5 w-5" />,
                                        title: "Actualizado el",
                                        value: formatDate(usuario.updated_at)
                                    }
                                ]}
                            />
                            <DetailSection
                                title="Unidad Responsable"
                                items={[
                                    {
                                        icon: <Building2 className="h-5 w-5" />,
                                        title: "Unidad",
                                        value: usuario.unidad_responsable ? usuario.unidad_responsable.nombre : "-",
                                        hint: usuario.unidad_responsable ? `ID: ${usuario.unidad_responsable.id_unidad}` : "No tiene unidad responsable asignada"
                                    },
                                    {
                                        icon: <Hash className="h-5 w-5" />,
                                        title: "Cargo Actual",
                                        value: usuario.cargos_actuales && usuario.cargos_actuales.length > 0
                                            ? cargoActual?.cargo?.nombre || "Cargo sin nombre"
                                            : (cargoActual ? `Unidad ID: ${cargoActual.unidad_responsable_id}` : "-"),
                                        hint: cargoActual ? `Asignado el ${formatDate(cargoActual.fecha_inicio)}` : "No tiene cargo asignado"
                                    }
                                ]}
                            />

                        </div>

                        {/* Seguridad: cambiar contraseña o resetear desde admin */}
                        <div className="py-6">
                            <h3 className="text-lg font-medium mb-4">Seguridad</h3>

                            <div className="flex flex-col gap-3">
                                {/* Botón único: abre el flujo correspondiente según permisos (self -> cambiar, admin -> resetear) */}
                                <Button
                                    onClick={() => {
                                        if (currentUser.username === usuario.username) {
                                            toast("Abriendo formulario de cambio de contraseña", { icon: <Lock className="h-5 w-5" /> });
                                            setOpenSelfChange(true);
                                        } else if (currentUser.role === 'ADMIN') {
                                            toast("Abriendo formulario de reseteo de contraseña", { icon: <RefreshCw className="h-5 w-5" /> });
                                            setResetTarget({ id: usuario.id, username: usuario.username });
                                            setOpenAdminReset(true);
                                        } else {
                                            toast.error('No tienes permisos para cambiar esta contraseña');
                                        }
                                    }}
                                    style={{ backgroundColor: '#24356B', color: 'white' }}
                                    disabled={isChangingPassword || isResettingPassword}
                                >
                                    {currentUser.username === usuario.username ? 'Cambiar contraseña' : 'Resetear contraseña'}
                                </Button>
                            </div>
                        </div>

                        {currentUser.role === 'ADMIN' && (
                            <div className="py-6">
                                <h3 className="text-lg font-medium mb-4">Asignación</h3>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={handleAddCargo}
                                        className='mt-3'
                                    >Asignar Cargo</Button>
                                </div>
                            </div>
                        )}



                        {/* Modal components */}
                        <ResetPasswordModal open={openSelfChange} onOpenChange={setOpenSelfChange} userId={usuario.id} username={usuario.username} mode="self" onSuccess={() => { /* no-op, handled inside modal */ }} />
                        <ResetPasswordModal open={openAdminReset} onOpenChange={(v) => { setOpenAdminReset(v); if (!v) setResetTarget(null); }} userId={resetTarget?.id ?? null} username={resetTarget?.username ?? null} mode="admin" onSuccess={() => { fetchUsuario(); setOpenAdminReset(false); }} />
                    </CardContent>
                </Card>

                {/* Modal para asignar cargo */}
                <Dialog open={openCargoModal} onOpenChange={setOpenCargoModal}>
                    <DialogContent className="w-[95vw] max-w-md">
                        <DialogHeader>
                            <DialogTitle>Asignar cargo</DialogTitle>
                            <DialogDescription>
                                Usuario: <strong>{usuario?.username}</strong><br />
                                Unidad: <strong>{usuario?.unidad_responsable?.nombre ?? "-"}</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Cargo</Label>
                                <Select value={selectedCargoId} onValueChange={setSelectedCargoId} disabled={cargosLoading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={cargosLoading ? "Cargando cargos..." : "Selecciona un cargo"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cargosDisponibles.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Motivo (opcional)</Label>
                                <Input
                                    value={motivoCargo}
                                    onChange={(e) => setMotivoCargo(e.target.value)}
                                    placeholder="Ej. Asignación desde panel de administración"
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => setOpenCargoModal(false)} disabled={assigningCargo}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleConfirmAssignCargo}
                                disabled={assigningCargo || !selectedCargoId}
                                style={{ backgroundColor: "#24356B", color: "white" }}
                            >
                                {assigningCargo ? "Asignando..." : "Confirmar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

    );
}

// Componente auxiliar para secciones de detalles
function DetailSection({ title, items }: {
    title: string;
    items: {
        icon: React.ReactNode;
        title: string;
        value: string;
        badge?: React.ReactNode;
        hint?: string;
    }[];
}) {
    return (
        <div>
            <h3 className="text-lg font-medium mb-4">{title}</h3>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-gray-100 text-gray-600 mt-1">
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-500">{item.title}</h4>
                                {item.hint && (
                                    <span className="text-xs text-gray-400">{item.hint}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-medium">{item.value}</p>
                                {item.badge}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Componente para el estado de carga
function LoadingSkeleton() {
    // Loading skeleton runs also during SSR/build; avoid accessing localStorage on server
    if (typeof window === 'undefined') return null;

    const usuario = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!usuario) {
        return null; // O un loading spinner si prefieres
    }
    // Simulación de un usuario actual
    const user = usuario || { username: "Cargando...", role: "Cargando..." };
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumbs */}
            <NavbarWithBreadcrumb
                user={usuario?.username || null}
                role={user && typeof user === 'object' ? "ADMIN" : ""}
            />
            <div className="max-w-4xl mx-auto p-4">
                <div className="mb-6">
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-5 w-32" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[...Array(4)].map((_, j) => (
                                        <div key={j} className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

