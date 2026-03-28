import React, { useState } from "react";
import { createCargo, CargoPayload, CargoResponse } from "@/app/services/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CreateCargoFormProps {
  onSuccess?: (cargo: CargoResponse) => void;
  onClose?: () => void;
}

export const CreateCargoForm: React.FC<CreateCargoFormProps> = ({ onSuccess, onClose }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (nombre.trim().length > 80) {
      toast.error("El nombre no puede exceder 80 caracteres");
      return;
    }
    setLoading(true);
    try {
      const payload: CargoPayload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        activo,
      };
      const result = await createCargo(payload);
      if (result && typeof result === 'object' && 'id' in result) {
        toast.success("Cargo creado correctamente");
        setNombre("");
        setDescripcion("");
        setActivo(true);
        onSuccess?.(result);
        onClose?.();
      } else if (result && typeof result === 'object' && 'detail' in result) {
        toast.error(result.detail);
      } else {
        toast.error("Error desconocido al crear el cargo");
      }
    } catch (error: any) {
      if (error?.message) toast.error(error.message);
      else toast.error("Error de red o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre *</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          maxLength={80}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          rows={2}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={activo} onCheckedChange={setActivo} id="activo" />
        <label htmlFor="activo" className="text-sm">Activo</label>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cargo"}
        </Button>
      </div>
    </form>
  );
};

export default CreateCargoForm;
