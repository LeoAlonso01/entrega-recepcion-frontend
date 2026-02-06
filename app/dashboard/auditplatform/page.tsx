'use client';

import NavbarWithBreadcrumb from '@/components/NavbarBreadcrumb';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/';

interface AuditLog {
    id: number;
    actor_id: number;
    action: string;
    object_type: string;
    object_id: string;
    timestamp: string;
    success: boolean;
    ip_address: string;
    metadata: Record<string, any> | null;
}

interface AuditResponse {
    total: number;
    items: AuditLog[];
}

export default function AuditPlatformPage() {
    const [audits, setAudits] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [skip, setSkip] = useState(0);
    const limit = 10;
    const router = useRouter();

    useEffect(() => {
        const fetchAudits = async () => {
            try {
                setError(null);
                setLoading(true);
                
                const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
                const headers: Record<string, string> = {
                    'Accept': 'application/json',
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(
                    `${API_URL}/admin/audit_logs?skip=${skip}&limit=${limit}`,
                    {
                        headers,
                        credentials: 'include',
                    }
                );

                if (response.status === 401) {
                    setError('No autorizado. Redirigiendo al login...');
                    setAudits([]);
                    setLoading(false);
                    setTimeout(() => router.push('/auth/login'), 700);
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data: AuditResponse = await response.json();
                setAudits(data.items || []);
                setTotal(data.total || 0);
            } catch (error) {
                console.error('Error fetching audits:', error);
                setError(error instanceof Error ? error.message : 'Error desconocido');
                setAudits([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAudits();
    }, [skip]);

    if (loading) return <div className="p-8">Cargando auditorías...</div>;

    return (
        <div className="p-8">
            <NavbarWithBreadcrumb />
            <h1 className="text-3xl font-bold mb-6">Auditorías de Plataforma</h1>
            
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            <p className="text-gray-600 mb-4">Total de registros: <strong>{total}</strong></p>
            
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-3 text-left">ID</th>
                            <th className="border p-3 text-left">Actor ID</th>
                            <th className="border p-3 text-left">Acción</th>
                            <th className="border p-3 text-left">Tipo Objeto</th>
                            <th className="border p-3 text-left">ID Objeto</th>
                            <th className="border p-3 text-left">Fecha</th>
                            <th className="border p-3 text-left">Estado</th>
                            <th className="border p-3 text-left">IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {audits.map((audit) => (
                            <tr key={audit.id} className="hover:bg-gray-50">
                                <td className="border p-3 text-sm">{audit.id}</td>
                                <td className="border p-3">{audit.actor_id}</td>
                                <td className="border p-3 font-medium">{audit.action}</td>
                                <td className="border p-3">{audit.object_type}</td>
                                <td className="border p-3 text-sm">{audit.object_id}</td>
                                <td className="border p-3 text-sm">
                                    {new Date(audit.timestamp).toLocaleString('es-ES')}
                                </td>
                                <td className="border p-3">
                                    <span className={`px-3 py-1 rounded text-white text-sm font-medium ${
                                        audit.success ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                        {audit.success ? '✓ Exitoso' : '✗ Fallido'}
                                    </span>
                                </td>
                                <td className="border p-3 text-sm">{audit.ip_address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {audits.length === 0 && (
                <div className="text-center text-gray-500 mt-8">No hay auditorías disponibles</div>
            )}

            {/* Paginación */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setSkip(Math.max(0, skip - limit))}
                    disabled={skip === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    ← Anterior
                </button>
                <span className="text-gray-600">
                    Página {Math.floor(skip / limit) + 1} de {Math.ceil(total / limit)}
                </span>
                <button
                    onClick={() => setSkip(skip + limit)}
                    disabled={skip + limit >= total}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Siguiente →
                </button>
            </div>
        </div>
    );
}