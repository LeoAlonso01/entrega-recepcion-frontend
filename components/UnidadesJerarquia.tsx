"use client";

import { useEffect, useState } from "react";
import { Building2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UnidadJerarquica } from "@/lib/unidadesJerarquia";
export type { UnidadJerarquica } from "@/lib/unidadesJerarquia";

export default function UnidadesJerarquia({ unidades }: { unidades: UnidadJerarquica[] }) {
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

    useEffect(() => {
        setExpandedNodes(new Set(unidades.filter(unidad => unidad.children?.length).map(unidad => unidad.id_unidad)));
    }, [unidades]);

    const toggleNode = (id: number) => {
        setExpandedNodes(previous => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const expandAll = () => {
        const ids = new Set<number>();
        const visit = (nodes: UnidadJerarquica[]) => nodes.forEach(node => {
            if (node.children?.length) {
                ids.add(node.id_unidad);
                visit(node.children);
            }
        });
        visit(unidades);
        setExpandedNodes(ids);
    };

    const renderNode = (unidad: UnidadJerarquica): React.ReactNode => {
        const children = unidad.children ?? [];
        const hasChildren = children.length > 0;
        const isExpanded = expandedNodes.has(unidad.id_unidad);
        const content = <>
            {hasChildren
                ? (isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" /> : <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />)
                : <span className="w-4 shrink-0" />}
            <Building2 className="h-5 w-5 shrink-0 text-[#24356B]" aria-hidden="true" />
            <span className="min-w-0 flex-1">
                <span className="block break-words text-sm font-medium text-gray-900">{unidad.nombre}</span>
                <span className="block text-xs text-gray-500">Responsable: {unidad.responsable?.username || "Sin asignar"}</span>
                {unidad.tipo_unidad && <span className="block text-xs text-gray-500">{unidad.tipo_unidad}</span>}
            </span>
            {hasChildren && <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-xs text-[#24356B]">{children.length} {children.length === 1 ? "dependencia" : "dependencias"}</span>}
        </>;

        return <li key={unidad.id_unidad} className="min-w-0">
            {hasChildren ? <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`unidad-hijos-${unidad.id_unidad}`}
                onClick={() => toggleNode(unidad.id_unidad)}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24356B]"
            >{content}</button> : <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">{content}</div>}
            {hasChildren && <ul id={`unidad-hijos-${unidad.id_unidad}`} hidden={!isExpanded} className="ml-3 mt-2 space-y-2 border-l-2 border-gray-200 pl-3 sm:ml-5 sm:pl-5">
                {isExpanded && children.map(renderNode)}
            </ul>}
        </li>;
    };

    return <div className="whitespace-normal">
        <div className="mb-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>Expandir todo</Button>
            <Button variant="outline" size="sm" onClick={() => setExpandedNodes(new Set())}>Contraer todo</Button>
        </div>
        <ul aria-label="Jerarquía de unidades responsables" className="space-y-3">{unidades.map(renderNode)}</ul>
    </div>;
}
