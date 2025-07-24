import React, { useState } from 'react';

interface Unidad {
  id_unidad: number;
  nombre: string;
}

interface Acta {
  folio?: string;
  fecha?: string;
  hora?: string;
  unidad_responsable?: string;
  comisionado?: string;
  oficio_comision?: string;
  fecha_oficio_comision?: string;
  entrante?: string;
  ine_entrante?: number;
  fecha_inicio_labores?: string;
  nombramiento?: string;
  fecha_nombramiento?: string;
  asignacion?: string;
  asiganado_por?: string;
  domicilio_entrante?: string;
  telefono_entrante?: string;
  saliente?: string;
  fecha_fin_labores?: string;
  testigo_entrante?: string;
  ine_testigo_entrante?: string;
  testigo_saliente?: string;
  ine_testigo_saliente?: string;
  fecha_cierre_acta?: string;
  hora_cierre_acta?: string;
  observaciones?: string;
  estado?: string;
}

interface Props {
  acta: Acta;
  unidades: Unidad[];
  onCancel: () => void;
  onSave: (data: Acta) => void;
}

const FormActa: React.FC<Props> = ({ acta, unidades, onCancel, onSave }) => {
  const [formData, setFormData] = useState<Acta>({
    ...acta
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //onSave(formData);
    // confirmacion antes de enviar 
    if (window.confirm("¿Estás seguro de que deseas guardar los cambios?")) {
        console.log("Datos del Acta guardados:", formData);
        onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">{acta ? "Editar Acta" : "Nueva Acta"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="folio" placeholder="Folio" value={formData.folio || ''} onChange={handleChange} />
        <input name="fecha" type="date" value={formData.fecha || ''} onChange={handleChange} />
        <input name="hora" type="time" value={formData.hora || ''} onChange={handleChange} />
        
        <select name="unidad_responsable" value={formData.unidad_responsable || ''} onChange={handleChange}>
          <option value="">Seleccionar unidad</option>
          {unidades.map(u => (
            <option key={u.id_unidad} value={u.nombre}>{u.nombre}</option>
          ))}
        </select>

        <input name="comisionado" placeholder="Comisionado" value={formData.comisionado || ''} onChange={handleChange} />
        <input name="oficio_comision" placeholder="Oficio" value={formData.oficio_comision || ''} onChange={handleChange} />
        <input name="fecha_oficio_comision" type="date" value={formData.fecha_oficio_comision || ''} onChange={handleChange} />
      </div>

      <h3 className="font-semibold mt-4">Funcionario Entrante</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="entrante" placeholder="Nombre" value={formData.entrante || ''} onChange={handleChange} />
        <input name="ine_entrante" type="number" placeholder="INE" value={formData.ine_entrante || ''} onChange={handleChange} />
        <input name="fecha_inicio_labores" type="date" value={formData.fecha_inicio_labores || ''} onChange={handleChange} />
        <input name="nombramiento" placeholder="Nombramiento" value={formData.nombramiento || ''} onChange={handleChange} />
        <input name="fecha_nombramiento" type="date" value={formData.fecha_nombramiento || ''} onChange={handleChange} />
        
        <select name="asignacion" value={formData.asignacion || ''} onChange={handleChange}>
          <option value="">Seleccionar asignación</option>
          <option value="nombramiento">Nombramiento</option>
          <option value="designacion">Designación</option>
          <option value="jerarquia">Jerarquía</option>
        </select>

        <select name="asiganado_por" value={formData.asiganado_por || ''} onChange={handleChange}>
          <option value="">Seleccionar asignado por</option>
          <option value="rectoria">Rectoría</option>
          <option value="h_consejo">H. Consejo</option>
        </select>

        <input name="domicilio_entrante" placeholder="Domicilio" value={formData.domicilio_entrante || ''} onChange={handleChange} />
        <input name="telefono_entrante" placeholder="Teléfono" value={formData.telefono_entrante || ''} onChange={handleChange} />
      </div>

      <h3 className="font-semibold mt-4">Funcionario Saliente</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="saliente" placeholder="Nombre" value={formData.saliente || ''} onChange={handleChange} />
        <input name="fecha_fin_labores" type="date" value={formData.fecha_fin_labores || ''} onChange={handleChange} />
      </div>

      <h3 className="font-semibold mt-4">Testigos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="testigo_entrante" placeholder="Testigo Entrante" value={formData.testigo_entrante || ''} onChange={handleChange} />
        <input name="ine_testigo_entrante" placeholder="INE" value={formData.ine_testigo_entrante || ''} onChange={handleChange} />
        <input name="testigo_saliente" placeholder="Testigo Saliente" value={formData.testigo_saliente || ''} onChange={handleChange} />
        <input name="ine_testigo_saliente" placeholder="INE" value={formData.ine_testigo_saliente || ''} onChange={handleChange} />
      </div>

      <h3 className="font-semibold mt-4">Cierre del Acta</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="fecha_cierre_acta" type="date" value={formData.fecha_cierre_acta || ''} onChange={handleChange} />
        <input name="hora_cierre_acta" type="time" value={formData.hora_cierre_acta || ''} onChange={handleChange} />
        <select name="estado" value={formData.estado || ''} onChange={handleChange}>
          <option value="">Seleccionar estado</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Completada">Completada</option>
          <option value="Revisión">Revisión</option>
        </select>
        <textarea name="observaciones" placeholder="Observaciones" value={formData.observaciones || ''} onChange={handleChange} />
      </div>

      <div className="mt-6 flex gap-4 justify-end ">

        <button className='bg-red-500 text-white px-4 py-2 rounded' type="button" onClick={onCancel}>Cancelar</button>
        <button className='bg-blue-500 text-white px-4 py-2 rounded' type="submit">Guardar Acta</button>
      </div>
    </form>
  );
};

export default FormActa;

