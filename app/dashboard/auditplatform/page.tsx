"use client";

import NavbarWithBreadcrumb from "@/components/NavbarBreadcrumb";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuditReferenceResolver, type AuditDisplay, type AuditLog } from "@/lib/auditReferences";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
interface AuditResponse { total: number; items: AuditLog[] }

export default function AuditPlatformPage() {
    const [rows, setRows] = useState<AuditDisplay[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [incomplete, setIncomplete] = useState(false);
    const [reload, setReload] = useState(0);
    const [skip, setSkip] = useState(0);
    const resolver = useRef<{ token: string | null; value: AuditReferenceResolver } | null>(null);
    const limit = 10;
    const router = useRouter();

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = { Accept: "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;
        if (!resolver.current || resolver.current.token !== token) {
            resolver.current = { token, value: new AuditReferenceResolver(path => fetch(`${API_URL}${path}`, { headers, credentials: "include" })) };
        }
        const currentResolver = resolver.current.value;
        const fetchAudits = async () => {
            try {
                setError(null);
                setIncomplete(false);
                setLoading(true);
                const response = await fetch(`${API_URL}/admin/audit_logs?skip=${skip}&limit=${limit}`, {
                    headers, credentials: "include", signal: controller.signal,
                });
                if (!active) return;
                if (response.status === 401) {
                    setError("No autorizado. Inicia sesión nuevamente.");
                    setRows([]);
                    router.replace("/");
                    return;
                }
                if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
                const data: AuditResponse = await response.json();
                if (!Array.isArray(data.items)) throw new Error("La respuesta de auditoría no es válida.");
                const display = await currentResolver.resolve(data.items);
                if (!active) return;
                setRows(display.rows);
                setIncomplete(display.incomplete);
                setTotal(Number.isFinite(data.total) && data.total >= 0 ? data.total : data.items.length);
            } catch (error) {
                if (!active) return;
                setError(error instanceof Error ? error.message : "No se pudieron consultar las auditorías.");
                setRows([]);
            } finally {
                if (active) setLoading(false);
            }
        };
        void fetchAudits();
        return () => { active = false; controller.abort(); };
    }, [skip, reload, router]);

    return (
        <div className="min-w-0 p-3 sm:p-8">
            <NavbarWithBreadcrumb />
            <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Auditorías de Plataforma</h1>
            {error && <div role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-800"><strong>Error: </strong>{error}</div>}
            {incomplete && <div role="status" className="mb-4 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Algunos nombres no pudieron consultarse. Los eventos de auditoría siguen disponibles.
                <button type="button" className="ml-2 underline" onClick={() => { resolver.current = null; setReload(value => value + 1); }}>Reintentar nombres</button>
            </div>}
            <p className="mb-4 text-gray-600">Total de registros: <strong>{total}</strong></p>
            {loading ? <p role="status" className="p-4 text-gray-600">Cargando auditorías y referencias...</p> : <>
                <div className="w-full max-w-full overflow-x-auto rounded-lg border border-gray-300">
                    <table className="min-w-full border-collapse text-sm">
                        <caption className="sr-only">Eventos de auditoría con nombres de usuarios y registros relacionados</caption>
                        <thead className="bg-gray-100"><tr>
                            <th scope="col" className="border p-3 text-left">Usuario</th>
                            <th scope="col" className="border p-3 text-left">Acción</th>
                            <th scope="col" className="border p-3 text-left">Tipo de registro</th>
                            <th scope="col" className="border p-3 text-left">Registro relacionado</th>
                            <th scope="col" className="border p-3 text-left">Unidad responsable</th>
                            <th scope="col" className="border p-3 text-left">Fecha</th>
                            <th scope="col" className="border p-3 text-left">Estado</th>
                            <th scope="col" className="border p-3 text-left">IP</th>
                        </tr></thead>
                        <tbody>{rows.map(({ event, actor, object, type, unit }) => <tr key={event.id} className="hover:bg-gray-50">
                            <td className="border p-3">{actor}</td>
                            <td className="border p-3 font-medium">{event.action}</td>
                            <td className="border p-3">{type}</td>
                            <td className="border p-3">{object}</td>
                            <td className="border p-3">{unit}</td>
                            <td className="border p-3">{Number.isNaN(Date.parse(event.timestamp)) ? "Fecha no registrada" : new Date(event.timestamp).toLocaleString("es-ES")}</td>
                            <td className="border p-3"><span className={`inline-block rounded px-3 py-1 font-medium text-white ${event.success ? "bg-green-700" : "bg-red-700"}`}>{event.success ? "✓ Exitoso" : "✗ Fallido"}</span></td>
                            <td className="border p-3">{event.ip_address || "No registrada"}</td>
                        </tr>)}</tbody>
                    </table>
                </div>
                {rows.length === 0 && !error && <p className="mt-8 text-center text-gray-500">No hay auditorías disponibles</p>}
            </>}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => setSkip(value => Math.max(0, value - limit))} disabled={loading || skip === 0}
                    className="rounded bg-[#24356B] px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400">← Anterior</button>
                <span className="text-gray-600">Página {Math.floor(skip / limit) + 1} de {Math.max(1, Math.ceil(total / limit))}</span>
                <button type="button" onClick={() => setSkip(value => value + limit)} disabled={loading || skip + limit >= total}
                    className="rounded bg-[#24356B] px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400">Siguiente →</button>
            </div>
        </div>
    );
}
