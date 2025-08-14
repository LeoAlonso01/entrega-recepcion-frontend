// app/dashboard/administracion/usuarios/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowLeft, User, Mail, Shield, Check, X, Calendar, Hash, Lock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import NavbarWithBreadcrumb from '../../../../../components/NavbarBreadcrumb';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Default to local if not set

interface Usuario {
    id: number;
    username: string;
    email: string;
    role: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    password?: string; // Campo opcional para no mostrarlo
}

export default function UsuarioDetallePage( user: Usuario | null) {
    const { id } = useParams();
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ username: string; role: string }>({ username: "", role: "" })

    const fetchUsuario = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push('/auth/login');
                return;
            }

            setRefreshing(true);
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Usuario no encontrado");
                }
                if (response.status === 401) {
                    throw new Error("Sesión expirada, por favor inicia sesión nuevamente");
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
                router.push('/dashboard/administracion/usuarios');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsuario();
    }, [id]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                    role={user?.role || ""}
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
                role={user?.role || ""}
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
                        </div>
                    </CardContent>
                </Card>
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

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser) {
        return null; // O un loading spinner si prefieres
    }
    // Simulación de un usuario actual
    const user = ''; currentUser || { username: "Cargando...", role: "Cargando..." };
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumbs */}
            <NavbarWithBreadcrumb
                user={currentUser?.username || null}
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


/* // app/dashboard/administracion/usuarios/[id]/page.tsx
import { useParams } from 'next/navigation';

export default function Page() {
  const { id } = useParams();
  return <div>ID del usuario: {id}</div>;
} */