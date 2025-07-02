'use client';

import React from "react";
import { useState, useEffect } from "react";
import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb";



export default function UnidadesResponsablesPage() {

    // Aquí puedes agregar el estado y lógica para manejar las unidades responsables
    const [unidades, setUnidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() =>{
        console.log("Cargando unidades responsables...");

    },[]);

    return (
        <>
            <div className="bg-gray-100">
                <NavbarWithBreadcrumb
                />
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