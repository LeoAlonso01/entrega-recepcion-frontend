'use client';

import React, { useState, useEffect } from "react";
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button";

// Definición del tipo Unidad
// Este tipo representa la estructura de una unidad responsable
// Incluye campos como id_unidad, nombre, responsable, unidad_padre_id y nivel para jerarquía
type Unidad = {
    id_unidad: number;
    nombre: string;
    responsable?: string | null;
    unidad_padre_id?: number | null;
    nivel?: number; // Añadido para jerarquía
    codigo_postal?: string; // Añadido para evitar error de propiedad faltante
    tipo_unidad?: string; // Añadido para evitar error de propiedad faltante
    rfc?: string; // Añadido para evitar error de propiedad faltante
    estado?: string; // Añadido para evitar error de propiedad faltante
};

// Extiende Unidad para jerarquía, agregando los campos usados en renderTreeNode
type UnidadJerarquica = Unidad & {
    estado?: string;
    tipo_unidad?: string;
    codigo_postal?: string;
    rfc?: string;
};



export default function UnidadesResponsablesPage() {
    // Estados
    const [token, setToken] = useState<string | null>(null);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [unidadesOriginales, setUnidadesOriginales] = useState<Unidad[]>([]);
    const [unidadesJerarquia, setUnidadesJerarquia] = useState<Unidad[]>([]);
    const [activeTab, setActiveTab] = useState("listado");
    const [loading, setLoading] = useState(true);
    const [loadingJerarquia, setLoadingJerarquia] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
    const router = useRouter();
    

    // Removed duplicate renderTreeNode function to resolve redeclaration error.

    // Verificar token al montar el componente
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        // validar si el token es valido

        if (!storedToken) {
            router.push("/");
            return;
        }

        setToken(storedToken);
        handleGetUnidades();
    }, [router]);

    // Obtener todas las unidades normales
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

    // Obtener unidades jerárquicas (solo cuando se selecciona la pestaña)
    const handleGetUnidadesJerarquicas = async () => {
        if (!token || unidadesJerarquia.length > 0) return;

        setLoadingJerarquia(true);

        try {
            const response = await fetch('http://localhost:8000/unidades_jerarquicas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al obtener unidades jerárquicas');

            const data = await response.json();
            setUnidadesJerarquia(data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoadingJerarquia(false);
        }
    };

    // Manejar cambio de pestaña
    const handleTabChange = (value: string) => {
        setActiveTab(value);

        if (value === "jerarquia") {
            handleGetUnidadesJerarquicas();
        }
    };

    // Renderizar nodo del árbol jerárquico
    const toggleNode = (id: number) => {
  const newExpanded = new Set(expandedNodes);
  if (newExpanded.has(id)) {
    newExpanded.delete(id);
  } else {
    newExpanded.add(id);
  }
  setExpandedNodes(newExpanded);
};

const renderTreeNode = (unidad: UnidadJerarquica) => {
  const children = unidadesJerarquia.filter(u => u.unidad_padre_id === unidad.id_unidad);
  const isExpanded = expandedNodes.has(unidad.id_unidad);
  const hasChildren = children.length > 0;
  
  return (
    <div key={unidad.id_unidad}>
      <div 
        className={`flex items-center py-1 cursor-pointer rounded hover:bg-gray-100 p-1 ${
          unidad.estado === 'inactivo' ? 'opacity-70' : ''
        }`}
        style={{ paddingLeft: `${(unidad.nivel || 0) * 20}px` }}
        onClick={() => hasChildren && toggleNode(unidad.id_unidad)}
      >
        {hasChildren && (
          <div className="mr-2 flex-shrink-0">
            {isExpanded ? (
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1h3a1 1 0 110 2h-3v1a1 1 0 11-2 0V7H6a1 1 0 110-2h3V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
        
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex-shrink-0 mr-2">
            {hasChildren ? (
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1h3a1 1 0 110 2h-3v1a1 1 0 11-2 0V6H6a1 1 0 110-2h3V4a1 1 0 111-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          <div className="min-w-0">
            <div className={`text-sm font-medium ${unidad.estado === 'inactivo' ? 'text-gray-500' : 'text-gray-900'}`}>
              {unidad.nombre}
            </div>
            {unidad.responsable && (
              <div className="text-xs text-gray-500 truncate">
                {unidad.responsable}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1 ml-6 border-l border-gray-200 pl-4">
          {children.map(renderTreeNode)}
        </div>
      )}
    </div>
  );
};

    // Filtro de búsqueda local
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();

        if (activeTab === "listado") {
            if (!searchTerm.trim()) {
                setUnidades(unidadesOriginales);
            } else {
                const filtered = unidadesOriginales.filter(unidad =>
                    unidad.nombre.toLowerCase().includes(searchTerm) ||
                    (unidad.responsable?.toLowerCase() || "").includes(searchTerm)
                );
                setUnidades(filtered);
            }
        }
    };

    return (
        <>
            <div className="bg-gray-100">
                <NavbarWithBreadcrumb role="admin" />
            </div>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Unidades Responsables</h1>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    {/* Pestañas */}
                    <TabsList className="grid w-full grid-cols-2 h-10 text-sm">
                        <TabsTrigger
                            value="listado"
                            className="data-[state=active]:bg-[#24356B] data-[state=active]:text-white rounded-t-lg px-4 py-2"
                        >
                            Listado de Unidades
                        </TabsTrigger>
                        <TabsTrigger
                            value="jerarquia"
                            className="data-[state=active]:bg-[#24356B] data-[state=active]:text-white rounded-t-lg px-4 py-2"
                        >
                            Árbol de Jerarquía
                        </TabsTrigger>
                    </TabsList>

                    {/* Contenido - Listado */}
                    <TabsContent value="listado" className="mt-4">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            {/* Header con búsqueda y acciones */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Buscar unidades por nombre o responsable..."
                                            className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-lg"
                                            onChange={handleSearch}
                                        />
                                        <svg
                                            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            className="px-4 py-2 bg-[#24356B] text-white rounded hover:bg-[#1c2a5d] transition-colors"
                                            onClick={() => alert('Exportar PDF')}
                                        >
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Exportar PDF
                                            </span>
                                        </button>

                                        <button
                                            className="px-4 py-2 bg-[#B59E60] text-white rounded hover:bg-[#a48d54] transition-colors"
                                            onClick={() => alert('Exportar Excel')}
                                        >
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
                                                </svg>
                                                Exportar Excel
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Contenido principal */}
                            <div className="p-6">
                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
                                        <span className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Error: {error.message}
                                        </span>
                                    </div>
                                )}

                                {loading ? (
                                    <div className="py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#24356B]"></div>
                                        <p className="mt-2 text-gray-600">Cargando unidades...</p>
                                    </div>
                                ) : unidades.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        <p>No se encontraron unidades</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold text-gray-800">Listado de Unidades</h2>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                                Agregar Unidad
                                            </button>
                                        </div>

                                        {/* Filtros adicionales */}
                                        <div className="mb-4 flex flex-wrap gap-4">
                                            <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                                                <option value="">Todos los tipos</option>
                                                <option value="departamento">Departamento</option>
                                                <option value="coordinacion">Coordinación</option>
                                                <option value="direccion">Dirección</option>
                                            </select>

                                            <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                                                <option value="">Todos los estados</option>
                                                <option value="activo">Activo</option>
                                                <option value="inactivo">Inactivo</option>
                                            </select>
                                        </div>

                                        {/* Tabla */}
                                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Nombre
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Tipo
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Responsable
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Estado
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Acciones
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {unidades.map((unidad) => (
                                                        <tr key={unidad.id_unidad} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="font-medium text-gray-900">{unidad.nombre}</div>
                                                                {unidad.codigo_postal && (
                                                                    <div className="text-xs text-gray-500">CP: {unidad.codigo_postal}</div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                    {unidad.tipo_unidad || 'Sin definir'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                                                        {unidad.responsable ? unidad.responsable[0].toUpperCase() : '?'}
                                                                    </div>
                                                                    <div className="ml-3">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {unidad.responsable || 'Sin asignar'}
                                                                        </div>
                                                                        {unidad.rfc && (
                                                                            <div className="text-xs text-gray-500">RFC: {unidad.rfc}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${unidad.estado === 'activo'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                    {unidad.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <button className="text-blue-600 hover:text-blue-900 mr-4">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828M8 7H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-2" />
                                                                    </svg>
                                                                </button>
                                                                <button className="text-red-600 hover:text-red-900">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Paginación */}
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                Mostrando <span className="font-medium">{Math.min(1, unidades.length)}</span> a <span className="font-medium">{Math.min(10, unidades.length)}</span> de <span className="font-medium">{unidades.length}</span> resultados
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Anterior</button>
                                                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">1</button>
                                                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Siguiente</button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Contenido - Jerarquía */}
                    <TabsContent value="jerarquia" className="mt-4">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800">Árbol Jerárquico</h2>
                                <p className="text-sm text-gray-500 mt-1">Visualización de unidades por nivel de jerarquía</p>
                            </div>

                            <div className="p-6">
                                {loadingJerarquia ? (
                                    <div className="py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#24356B]"></div>
                                        <p className="mt-2 text-gray-600">Cargando unidades jerárquicas...</p>
                                    </div>
                                ) : error && activeTab === "jerarquia" ? (
                                    <div className="p-4 bg-red-50 text-red-700 rounded">
                                        <span className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Error: {error.message}
                                        </span>
                                    </div>
                                ) : unidadesJerarquia.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2m14 0h-3" />
                                        </svg>
                                        <p>No hay unidades jerárquicas disponibles</p>
                                    </div>
                                ) : (
                                    <div className="border border-gray-200 rounded p-4">
                                        <div className="space-y-1">
                                            {unidadesJerarquia
                                                .filter(u => !u.unidad_padre_id)
                                                .map(unidad => renderTreeNode(unidad))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}