'use client';

import React from "react";
import { useState, useEffect } from "react";
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { set } from "date-fns";

export default function UnidadesResponsablesPage(acces_token: string | null) {

    // Aquí puedes agregar el estado y lógica para manejar las unidades responsables
    type Unidad = {
        id_unidad: number;
        nombre: string;
        responsable: string;
        unidad_padre_id?: number; // Agregado para jerarquía
    };

    // Estados para manejar las unidades y su jerarquía
    // Puedes agregar más estados según sea necesario
    const [token, setToken] = useState<string | null>(acces_token);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("listado");
    const [unidadesJerarquia, setUnidadesJerarquia] = useState<Unidad[]>([]);
    const [loadingJerarquia, setLoadingJerarquia] = useState(true);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [unidadesOriginales, setUnidadesOriginales] = useState<Unidad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {

        // consulta de las unidades responsables
        handleGetUnidades();
        console.log("Unidades responsables cargadas:", unidades);
    }, []);


    // Función para manejar el cambio de pestaña
    // Puedes implementar la lógica para cambiar entre las pestañas de listado y jerarquía
    // y cargar las unidades jerárquicas si es necesario.
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === "jeraquia" && unidadesJerarquia.length === 0) {
            handleUnidadesJerarquicas();
        }
    };

    // Función para manejar la obtención de unidades jerárquicas
    // Puedes implementar la lógica para obtener las unidades jerárquicas desde tu API
    // y actualizar el estado `unidadesJerarquia` con los datos obtenidos.
    const handleUnidadesJerarquicas = async () => {
        // Aquí puedes hacer una llamada a la API para obtener las unidades jerárquicas
        const token = localStorage.getItem("token");
        const router = useRouter();
        if (!token) {
            console.error("Token de acceso no encontrado. Redirigiendo a la página de inicio");
            // Redirige al usuario a la página de inicio o de inicio de sesión
            router.push("/");
            return;
        }

        setLoadingJerarquia(true);
        try {
            const response = await fetch("http://localhost:8000/unidades_jerarquicas", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // enviar token de acceso en el header
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener las unidades jerárquicas');
            }

            const data = await response.json();
            console.log("Unidades jerárquicas obtenidas:", data);
            setUnidadesJerarquia(data); // Actualizar el estado con las unidades jerárquicas obtenidas
            setLoadingJerarquia(false);
        } catch (e) {
            console.error("Error al obtener las unidades jerárquicas:", e);
            setError(e as Error);
            setLoadingJerarquia(false);

        }
    }

    const handleGetUnidades = async () => {
        // Aquí puedes obtener el token de acceso desde localStorage
        const token = localStorage.getItem("token");

        // Verifica si el token es válido
        if (!token) {
            console.error("Token de acceso no encontrado. Redirigiendo a la página de inicio");
            // Redirige al usuario a la página de inicio o de inicio de sesión
            setError(new Error("Token de acceso no encontrado. Redirigiendo a la página de inicio"));
            const router = useRouter();
            router.push("/");
            return;
        } else {
            console.log("Token de acceso encontrado y valido!! :", token);
        }
        try {
            // Aquí puedes hacer una llamada a la API para obtener las unidades responsables
            const response = await fetch('http://localhost:8000/unidades_responsables', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // enviar token de acceso en el header
                    'Authorization': `Bearer ${token}`
                }

            });

            if (!response.ok) {
                throw new Error('Error al obtener las unidades responsables');
            }

            const data = await response.json();
            console.log("Unidades responsables obtenidas:", data);
            setUnidades(data); // Actualizar el estado con las unidades obtenidas
            setUnidadesOriginales(data); // Guardar las unidades originales para futuras búsquedas
            setLoading(false);


        } catch (error) {

            console.error("Error al obtener las unidades responsables:", error);
            setError(error as Error);
            setLoading(false);
        }
    }

        const renderTreeNode = (unidad: Unidad) => {
            const isLeaf = !unidadesJerarquia.some(
                (u) => u.unidad_padre_id === unidad.id_unidad
            );
    
            return (
                <React.Fragment key={unidad.id_unidad}>
                    <div className="flex items-center" style={{ marginLeft: `${(unidad.unidad_padre_id ? 1 : 0) * 20}px` }}>
                        {!isLeaf && <span className="mr-2">📁</span>}
                        {unidad.nombre}
                        {unidad.responsable && (
                            <span className="text-xs text-gray-500 ml-2">
                                ({unidad.responsable})
                            </span>
                        )}
                    </div>
                    {/* Renderizar hijos recursivamente si existen */}
                    {unidadesJerarquia
                        .filter((u) => u.unidad_padre_id === unidad.id_unidad)
                        .map(renderTreeNode)}
                </React.Fragment>
            );
        }
    
        return (
            <>
                <div className="bg-gray-100">
                    <NavbarWithBreadcrumb role="admin" />
                </div>
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">Unidades Responsables</h1>
    
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-md mx-auto mt-10">
                        <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10 text-xs s,:text-sm ">
                            <TabsTrigger value="listado" className="data-[state=active]:bg-[#24356B] data-[state=active]:text-white">
                                Listado de Unidades
                            </TabsTrigger>
                            <TabsTrigger value="jerarquia" className="data-[state=active]:bg-[#24356B] data-[state=active]:text-white">
                                Arbol de Jerarquía
                            </TabsTrigger>
                        </TabsList>
    
                        <TabsContent value="listado">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Buscar unidades por nombre o responsable..."
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                                    onChange={(e) => {
                                        const searchTerm = e.target.value.toLowerCase();
                                        if (searchTerm.trim() === "") {
                                            setUnidades(unidadesOriginales);
                                        } else {
                                            const filteredUnidades = unidadesOriginales.filter((unidad) =>
                                                unidad.nombre.toLowerCase().includes(searchTerm) ||
                                                unidad.responsable?.toLowerCase().includes(searchTerm)
                                            );
                                            setUnidades(filteredUnidades);
                                        }
                                    }}
                                    onFocus={() => setUnidades(unidadesOriginales)}
                                    onBlur={() => setUnidades(unidadesOriginales)}
                                />
                            </div>
    
                            <div className="bg-white shadow rounded-lg p-6">
                                {error && <p className="text-red-500">Error: {error.message}</p>}
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold">Listado de Unidades</span>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                        Agregar Unidad
                                    </button>
                                </div>
                                {unidades.length === 0 && !loading && !error && (
                                    <p className="text-gray-500 text-center py-4">No se encontraron unidades.</p>
                                )}
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nombre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Responsable
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {unidades.length > 0 ? (
                                            unidades.map((unidad) => (
                                                <tr key={unidad.id_unidad}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {unidad.nombre}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {unidad.responsable || "Sin asignar"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button className="text-blue-600 hover:text-blue-900">
                                                            Editar
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-900 ml-4">
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-center">
                                                    Cargando unidades...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>
                        <TabsContent value="jerarquia">
                            <div className="container mx-auto px-4 py-8">
                                <input
                                    type="text"
                                    placeholder="Buscar unidades por nombre o responsable..."
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                                    onChange={(e) => {
                                        const searchTerm = e.target.value.toLowerCase();
                                        if (searchTerm.trim() === "") {
                                            setUnidades(unidadesOriginales);
                                        } else {
                                            const filteredUnidades = unidadesOriginales.filter((unidad) =>
                                                unidad.nombre.toLowerCase().includes(searchTerm) ||
                                                unidad.responsable?.toLowerCase().includes(searchTerm)
                                            );
                                            setUnidades(filteredUnidades);
                                        }
                                    }}
                                    onFocus={() => setUnidades(unidadesOriginales)}
                                    onBlur={() => setUnidades(unidadesOriginales)}
                                />
                                <div>
                                    {unidadesJerarquia
                                        .filter((unidad) => !unidad.unidad_padre_id)
                                        .map(renderTreeNode)}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </>
        );
    }