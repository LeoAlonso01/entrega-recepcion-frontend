// components/FormActaSimple.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormActaSimpleProps {
  acta?: Partial<{
    id: number;
    unidad_responsable: number;
    folio: string;
    fecha: string;
    hora: string;
    comisionado: string;
    oficio_comision: string;
    fecha_oficio_comision: string;
    entrante: string;
    ine_entrante: string;
    fecha_inicio_labores: string;
    nombramiento: string;
    fecha_nombramiento: string;
    asignacion: string;
    asignado_por: string;
    domicilio_entrante: string;
    telefono_entrante: string;
    saliente: string;
    fecha_fin_labores: string;
    testigo_entrante: string;
    ine_testigo_entrante: string;
    testigo_saliente: string;
    ine_testigo_saliente: string;
    fecha_cierre_acta: string;
    hora_cierre_acta: string;
    observaciones: string;
    estado: "Pendiente" | "Completada" | "Revisión";
  }>;
  unidades: Array<{ id_unidad: number; nombre: string }>;
  onCancel: () => void;
  onSave: (data: any) => void;
}

const folioNuevo = () => {
  // genera numero de folio consecuitivo comenzando del 0001
  const consecutiveNumber = String(Math.floor(Math.random() * 10000)).padStart(5, "0");
  // obtiene los ultimos dos digitos del año actual
  const year = new Date().getFullYear().toString().slice(-2);
  return `ACTA-${consecutiveNumber}-${year}`;
}

export default function FormActa({
  acta = {},
  unidades,
  onCancel,
  onSave,
}: FormActaSimpleProps) {
  const [formData, setFormData] = useState({
    // Datos generales
    unidad_responsable: acta.unidad_responsable || unidades[0]?.id_unidad || "",
    folio: acta.folio || folioNuevo(),
    fecha: acta.fecha || new Date().toISOString().split("T")[0],
    hora: acta.hora || "",
    
    // Comisionado
    comisionado: acta.comisionado || "",
    oficio_comision: acta.oficio_comision || "",
    fecha_oficio_comision: acta.fecha_oficio_comision || "",

    // Entrante
    entrante: acta.entrante || "",
    ine_entrante: acta.ine_entrante || "",
    fecha_inicio_labores: acta.fecha_inicio_labores || "",
    nombramiento: acta.nombramiento || "",
    fecha_nombramiento: acta.fecha_nombramiento || "",
    asignacion: acta.asignacion || "",
    asignado_por: acta.asignado_por || "",
    domicilio_entrante: acta.domicilio_entrante || "",
    telefono_entrante: acta.telefono_entrante || "",

    // Saliente
    saliente: acta.saliente || "",
    fecha_fin_labores: acta.fecha_fin_labores || "",

    // Testigos
    testigo_entrante: acta.testigo_entrante || "",
    ine_testigo_entrante: acta.ine_testigo_entrante || "",
    testigo_saliente: acta.testigo_saliente || "",
    ine_testigo_saliente: acta.ine_testigo_saliente || "",

    // Cierre
    fecha_cierre_acta: acta.fecha_cierre_acta || "",
    hora_cierre_acta: acta.hora_cierre_acta || "",
    observaciones: acta.observaciones || "",
    estado: acta.estado || "Pendiente",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm("¿Guardar cambios?")) return;

    // Solo incluir ID si existe (para edición)
    const dataToSend = acta.id ? { ...formData, id: acta.id } : formData;
    onSave(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-xl font-bold text-gray-700">
        {acta.id ? "Editar Acta" : "Nueva Acta"}
      </h2>

      {/* --- DATOS GENERALES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Unidad</label>
          <select
            name="unidad_responsable"
            value={formData.unidad_responsable}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          >
            {unidades.map((u) => (
              <option key={u.id_unidad} value={u.id_unidad}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Folio</label>
          <input
            type="text"
            name="folio"
            value={formData.folio}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hora</label>
          <input
            type="time"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Revisión">Revisión</option>
            <option value="Completada">Completada</option>
          </select>
        </div>
      </div>

      {/* --- COMISIONADO --- */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-600">Comisionado</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <input
            type="text"
            name="comisionado"
            placeholder="Nombre del comisionado"
            value={formData.comisionado}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            name="oficio_comision"
            placeholder="Oficio de comisión"
            value={formData.oficio_comision}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="date"
            name="fecha_oficio_comision"
            value={formData.fecha_oficio_comision}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>

      {/* --- FUNCIONARIO ENTRANTE --- */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-600">Funcionario Entrante</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <input
            type="text"
            name="entrante"
            placeholder="Nombre"
            value={formData.entrante}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            name="ine_entrante"
            placeholder="INE"
            value={formData.ine_entrante}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="date"
            name="fecha_inicio_labores"
            value={formData.fecha_inicio_labores}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            name="nombramiento"
            placeholder="Nombramiento"
            value={formData.nombramiento}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="date"
            name="fecha_nombramiento"
            value={formData.fecha_nombramiento}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <select
            name="asignacion"
            value={formData.asignacion}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Tipo de asignación</option>
            <option value="nombramiento">Nombramiento</option>
            <option value="designacion">Designación</option>
            <option value="jerarquia">Jerarquía</option>
          </select>
          <select
            name="asignado_por"
            value={formData.asignado_por}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Asignado por</option>
            <option value="rectoria">Rectoría</option>
            <option value="h_consejo">H. Consejo</option>
          </select>
          <input
            type="text"
            name="domicilio_entrante"
            placeholder="Domicilio"
            value={formData.domicilio_entrante}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            name="telefono_entrante"
            placeholder="Teléfono"
            value={formData.telefono_entrante}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>

      {/* --- FUNCIONARIO SALIENTE --- */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-600">Funcionario Saliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <input
            type="text"
            name="saliente"
            placeholder="Nombre"
            value={formData.saliente}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="date"
            name="fecha_fin_labores"
            value={formData.fecha_fin_labores}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>

      {/* --- TESTIGOS --- */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-600">Testigos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <input
            type="text"
            name="testigo_entrante"
            placeholder="Testigo entrante"
            value={formData.testigo_entrante}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            name="ine_testigo_entrante"
            placeholder="INE"
            value={formData.ine_testigo_entrante}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            name="testigo_saliente"
            placeholder="Testigo saliente"
            value={formData.testigo_saliente}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            name="ine_testigo_saliente"
            placeholder="INE"
            value={formData.ine_testigo_saliente}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>

      {/* --- CIERRE DEL ACTA --- */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-600">Cierre del Acta</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <input
            type="date"
            name="fecha_cierre_acta"
            value={formData.fecha_cierre_acta}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="time"
            name="hora_cierre_acta"
            value={formData.hora_cierre_acta}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <Textarea
            name="observaciones"
            placeholder="Observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 resize-none h-24"
          />
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" style={{ backgroundColor: "#24356B", color: "white" }}>
          Guardar Acta
        </Button>
      </div>
    </form>
  );
}