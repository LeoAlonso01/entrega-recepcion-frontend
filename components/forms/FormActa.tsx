import React, { useState } from 'react';
import { createActa } from './../../app/services/api';
import { toast } from 'sonner';

const createFolio = () => {
  const year = new Date().getFullYear()
  const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `FOLIO-${year}-${randomNumber}`
}

const createDate = () => {
  return new Date().toISOString().split("T")[0]
}

const folioFinal = createFolio()
const fechaFinal = createDate()
const horaFinal = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

interface Unidad {
  id_unidad: number;
  nombre: string;
}

interface ActaForm {
  id: number;
  unidad_responsable: number;
  folio?: string;
  fecha: string;
  hora?: string;
  comisionado?: string;
  oficio_comision?: string;
  fecha_oficio_comision?: string;
  entrante: string;
  ine_entrante?: string;
  fecha_inicio_labores?: string;
  nombramiento?: string;
  fecha_nombramiento?: string;
  asignacion?: string;
  asignado_por?: string;
  domicilio_entrante?: string;
  telefono_entrante?: string;
  saliente: string;
  fecha_fin_labores?: string;
  testigo_entrante?: string;
  ine_testigo_entrante?: string;
  testigo_saliente?: string;
  ine_testigo_saliente?: string;
  fecha_cierre_acta?: string;
  hora_cierre_acta?: string;
  observaciones?: string;
  estado: "Pendiente" | "Completada" | "Revisión";
}

function prepareActaData(formData: ActaForm): ActaForm {
  // Convierte strings vacíos a undefined para no enviar campos vacíos
  const cleanString = (str?: string) => (str && str.trim() !== "" ? str : undefined);

  return {
    id: formData.id,
    unidad_responsable: Number(formData.unidad_responsable),
    folio: cleanString(formData.folio) || folioFinal,
    fecha: cleanString(formData.fecha) || fechaFinal,
    hora: cleanString(formData.hora) || horaFinal,
    comisionado: cleanString(formData.comisionado),
    oficio_comision: cleanString(formData.oficio_comision),
    fecha_oficio_comision: cleanString(formData.fecha_oficio_comision),
    entrante: cleanString(formData.entrante) || "",
    ine_entrante: cleanString(formData.ine_entrante),
    fecha_inicio_labores: cleanString(formData.fecha_inicio_labores),
    nombramiento: cleanString(formData.nombramiento),
    fecha_nombramiento: cleanString(formData.fecha_nombramiento),
    asignacion: cleanString(formData.asignacion),
    asignado_por: cleanString(formData.asignado_por),
    domicilio_entrante: cleanString(formData.domicilio_entrante),
    telefono_entrante: cleanString(formData.telefono_entrante),
    saliente: cleanString(formData.saliente) || "",
    fecha_fin_labores: cleanString(formData.fecha_fin_labores),
    testigo_entrante: cleanString(formData.testigo_entrante),
    ine_testigo_entrante: cleanString(formData.ine_testigo_entrante),
    testigo_saliente: cleanString(formData.testigo_saliente),
    ine_testigo_saliente: cleanString(formData.ine_testigo_saliente),
    fecha_cierre_acta: cleanString(formData.fecha_cierre_acta),
    hora_cierre_acta: cleanString(formData.hora_cierre_acta),
    observaciones: cleanString(formData.observaciones),
    estado: formData.estado || "Pendiente",
  };
}

interface Props {
  acta: ActaForm;
  unidades: Unidad[];
  onCancel: () => void;
  onSave: (data: ActaForm) => void;
}

const FormActa: React.FC<Props> = ({ acta, unidades, onCancel, onSave }) => {
  const [formData, setFormData] = useState<ActaForm>({
    ...acta,
    unidad_responsable: acta.unidad_responsable || (unidades[0]?.id_unidad || 0),
    estado: acta.estado || "Pendiente",
    fecha: acta.fecha || fechaFinal,
    hora: acta.hora || horaFinal,
    entrante: acta.entrante || "",
    saliente: acta.saliente || "",
  });

  const validateForm = (data: ActaForm): string | null => {
    if (!data.unidad_responsable) return "Unidad responsable es requerida";
    if (!data.entrante) return "Nombre del entrante es requerido";
    if (!data.saliente) return "Nombre del saliente es requerido";
    return null;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'unidad_responsable' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const actaToSend = prepareActaData(formData);
      console.log("Datos del acta a enviar:", actaToSend);
      
      if (!window.confirm("¿Estás seguro de que deseas guardar los cambios?")) {
        return;
      }

      // Aquí deberías llamar a tu API para crear/actualizar el acta
      // const response = await createActa(actaToSend);
      toast.success("Acta guardada exitosamente.");
      onSave(actaToSend);

    } catch (error: any) {
      console.error('Error al guardar acta:', error);
      const errorMessage = error.response?.data?.detail ||
        error.message ||
        "Error desconocido al guardar acta";
      toast.error(`Error: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-700">
        {acta.id ? "Editar Acta" : "Nueva Acta"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Folio</label>
          <input 
            name="folio" 
            value={formData.folio || folioFinal} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
          <input 
            name="fecha" 
            type="date" 
            value={formData.fecha || fechaFinal} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Hora</label>
          <input 
            name="hora" 
            type="time" 
            value={formData.hora || horaFinal} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Unidad Responsable *</label>
          <select 
            name="unidad_responsable" 
            value={formData.unidad_responsable} 
            onChange={handleChange} 
            className="input w-full"
            required
          >
            {unidades.map(u => (
              <option key={u.id_unidad} value={u.id_unidad}>{u.nombre}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Comisionado</label>
          <input 
            name="comisionado" 
            placeholder="Comisionado" 
            value={formData.comisionado || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Oficio de Comisión</label>
          <input 
            name="oficio_comision" 
            placeholder="Oficio" 
            value={formData.oficio_comision || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Fecha Oficio Comisión</label>
          <input 
            name="fecha_oficio_comision" 
            type="date" 
            value={formData.fecha_oficio_comision || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-600 mt-6">Funcionario Entrante</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Nombre *</label>
          <input 
            name="entrante" 
            placeholder="Nombre" 
            value={formData.entrante || ''} 
            onChange={handleChange} 
            className="input w-full" 
            required
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">INE</label>
          <input 
            name="ine_entrante" 
            placeholder="INE" 
            value={formData.ine_entrante || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Fecha Inicio Labores</label>
          <input 
            name="fecha_inicio_labores" 
            type="date" 
            value={formData.fecha_inicio_labores || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Nombramiento</label>
          <input 
            name="nombramiento" 
            placeholder="Nombramiento" 
            value={formData.nombramiento || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Fecha Nombramiento</label>
          <input 
            name="fecha_nombramiento" 
            type="date" 
            value={formData.fecha_nombramiento || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Asignación</label>
          <select 
            name="asignacion" 
            value={formData.asignacion || ''} 
            onChange={handleChange} 
            className="input w-full"
          >
            <option value="">Seleccionar asignación</option>
            <option value="nombramiento">Nombramiento</option>
            <option value="designacion">Designación</option>
            <option value="jerarquia">Jerarquía</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Asignado por</label>
          <select 
            name="asignado_por" 
            value={formData.asignado_por || ''} 
            onChange={handleChange} 
            className="input w-full"
          >
            <option value="">Seleccionar asignado por</option>
            <option value="rectoria">Rectoría</option>
            <option value="h_consejo">H. Consejo</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Domicilio</label>
          <input 
            name="domicilio_entrante" 
            placeholder="Domicilio" 
            value={formData.domicilio_entrante || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input 
            name="telefono_entrante" 
            placeholder="Teléfono" 
            value={formData.telefono_entrante || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-600 mt-6">Funcionario Saliente</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Nombre *</label>
          <input 
            name="saliente" 
            placeholder="Nombre" 
            value={formData.saliente || ''} 
            onChange={handleChange} 
            className="input w-full" 
            required
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Fecha Fin Labores</label>
          <input 
            name="fecha_fin_labores" 
            type="date" 
            value={formData.fecha_fin_labores || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-600 mt-6">Testigos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Testigo Entrante</label>
          <input 
            name="testigo_entrante" 
            placeholder="Testigo Entrante" 
            value={formData.testigo_entrante || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">INE Testigo Entrante</label>
          <input 
            name="ine_testigo_entrante" 
            placeholder="INE" 
            value={formData.ine_testigo_entrante || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Testigo Saliente</label>
          <input 
            name="testigo_saliente" 
            placeholder="Testigo Saliente" 
            value={formData.testigo_saliente || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">INE Testigo Saliente</label>
          <input 
            name="ine_testigo_saliente" 
            placeholder="INE" 
            value={formData.ine_testigo_saliente || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-600 mt-6">Cierre del Acta</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Fecha Cierre</label>
          <input 
            name="fecha_cierre_acta" 
            type="date" 
            value={formData.fecha_cierre_acta || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Hora Cierre</label>
          <input 
            name="hora_cierre_acta" 
            type="time" 
            value={formData.hora_cierre_acta || ''} 
            onChange={handleChange} 
            className="input w-full" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select 
            name="estado" 
            value={formData.estado || 'Pendiente'} 
            onChange={handleChange} 
            className="input w-full"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Completada">Completada</option>
            <option value="Revisión">Revisión</option>
          </select>
        </div>
        
        <div className="md:col-span-3 space-y-1">
          <label className="block text-sm font-medium text-gray-700">Observaciones</label>
          <textarea 
            name="observaciones" 
            placeholder="Observaciones" 
            value={formData.observaciones || ''} 
            onChange={handleChange} 
            className="input w-full h-24 resize-none" 
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Guardar Acta
        </button>
      </div>
    </form>
  );
};

export default FormActa;

