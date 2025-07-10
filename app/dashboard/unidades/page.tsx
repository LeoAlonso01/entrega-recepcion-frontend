'use client';

import React from "react";
import { useState, useEffect } from "react";
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb";
import { useRouter } from "next/navigation";

export default function UnidadesResponsablesPage( acces_token: string | null) {

    // Aquí puedes agregar el estado y lógica para manejar las unidades responsables
    const [unidades, setUnidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() =>{
       
        // consulta de las unidades responsables
        handleGetUnidades();

        console.log("Unidades responsables cargadas:", unidades);
    },[]);

    const handleGetUnidades = async () => {
        // Aquí puedes obtener el token de acceso desde localStorage
        const token =  localStorage.getItem("token");
        
        // Verifica si el token es válido
        if (!token) {
            console.error("Token de acceso no encontrado. Redirigiendo a la página de inicio");
            // Redirige al usuario a la página de inicio o de inicio de sesión
            setError(new Error("Token de acceso no encontrado. Redirigiendo a la página de inicio"));
            const router = useRouter();
            router.push("/");
            return;
        }else {
            console.log("Token de acceso encontrado y valido!! :", token);
        }
        try {
            // Aquí puedes hacer una llamada a la API para obtener las unidades responsables
            const response = await fetch('http://148.216.25.183:8000/unidades_responsables',{
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
            setUnidades(data);
            setLoading(false);


            
            
        } catch (error) {

            console.error("Error al obtener las unidades responsables:", error);
            setError(error as Error);
            setLoading(false);
        }
    }

    return (
        <>
            <div className="bg-gray-100">
                <NavbarWithBreadcrumb role="admin" />
            </div>      

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Unidades Responsables</h1>
                <div className="bg-white shadow rounded-lg p-6">
                    {/* Aquí puedes agregar la tabla o lista de unidades responsables */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Listado de Unidades</span>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Agregar Unidad
                        </button>
                    </div>
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
                            {/* Ejemplo de fila */}
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap">Unidad 1</td>
                                <td className="px-6 py-4 whitespace-nowrap">Juan Pérez</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-blue-600 hover:underline mr-2">Editar</button>
                                    <button className="text-red-600 hover:underline">Eliminar</button>
                                </td>
                            </tr>
                            {/* Más filas aquí */}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}