// components/FormActaSimple.tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import ActaSearch from "./ActaSearch";
import ActaPersonSearch from "./ActaPersonSearch";
import { Textarea } from "@/components/ui/textarea";

export interface ActaUsuario {
  id: number;
  username: string;
  nombre_completo?: string | null;
  nombre?: string | null;
  full_name?: string | null;
  email: string;
  role: "ADMIN" | "AUDITOR" | "USER";
  is_deleted?: boolean;
}

export const nombreUsuarioParaActa = (usuario?: ActaUsuario) =>
  usuario?.nombre_completo?.trim() || usuario?.full_name?.trim() || usuario?.nombre?.trim() || "";

export interface ActaComision {
  usuario_id: number | null;
  nombre?: string;
  mismo_oficio: boolean;
  oficio_comision: string;
  fecha_oficio_comision: string;
}

interface FormActaSimpleProps {
  acta?: Partial<{
    id: number;
    unidad_responsable: number;
    folio: string;
    fecha: string;
    hora: string;
    comisionado: string;
    comisionados: number[];
    comisiones: ActaComision[];
    entrante_id: number | null;
    saliente_id: number | null;
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
  usuarios: ActaUsuario[];
  usuariosCargando?: boolean;
  usuariosError?: string;
  onRetryUsuarios?: () => void;
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
  usuarios,
  usuariosCargando = false,
  usuariosError = "",
  onRetryUsuarios,
  onCancel,
  onSave,
}: FormActaSimpleProps) {
  const [formData, setFormData] = useState({
    // Datos generales
    unidad_responsable: acta.unidad_responsable || "",
    folio: acta.folio || folioNuevo(),
    fecha: acta.fecha || new Date().toISOString().split("T")[0],
    hora: acta.hora || "",
    
    // Comisionado
    comisionado: acta.comisionado || "",
    comisionados: acta.comisionados ?? acta.comisiones?.flatMap(comision => comision.usuario_id === null ? [] : [comision.usuario_id]) ?? [],
    entrante_id: acta.entrante_id,
    saliente_id: acta.saliente_id,
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

  const [comisionadosManuales, setComisionadosManuales] = useState(() =>
    (acta.comisiones || []).filter(comision => comision.usuario_id === null)
      .map((comision, index) => ({ key: `manual-${index}`, datos: comision })));
  const siguienteManual = useRef(comisionadosManuales.length);
  const [nombreComisionadoManual, setNombreComisionadoManual] = useState("");
  const [capturaComisionadoManual, setCapturaComisionadoManual] = useState(false);
  const agregarComisionadoManual = () => {
    const nombre = nombreComisionadoManual.trim();
    if (!nombre) return;
    const key = `manual-${siguienteManual.current++}`;
    setComisionadosManuales(prev => [...prev, {
      key,
      datos: { usuario_id: null, nombre, mismo_oficio: true, oficio_comision: "", fecha_oficio_comision: "" },
    }]);
    setNombreComisionadoManual("");
  };
  const [comisiones, setComisiones] = useState<ActaComision[]>(acta.comisiones || []);
  const actualizarComision = (id: number, cambios: Partial<ActaComision>) => {
    setComisiones(prev => {
      const actual = prev.find(comision => comision.usuario_id === id) || {
        usuario_id: id, mismo_oficio: true, oficio_comision: "", fecha_oficio_comision: "",
      };
      return [...prev.filter(comision => comision.usuario_id !== id), { ...actual, ...cambios }];
    });
  };
  const quitarComisionado = (id: number) => {
    actualizarComisionados(formData.comisionados.filter(selected => selected !== id));
    setComisiones(prev => prev.filter(comision => comision.usuario_id !== id));
  };
  const [unidadBusqueda, setUnidadBusqueda] = useState<string | null>(null);
  const [comisionadoBusqueda, setComisionadoBusqueda] = useState("");
  const [errorSeleccion, setErrorSeleccion] = useState("");
  const usuariosActivos = usuarios.filter(usuario => !usuario.is_deleted);
  const opcionesUsuario = (lista: ActaUsuario[]) => lista.map(usuario => ({
    id: usuario.id, label: usuario.username, nombre: nombreUsuarioParaActa(usuario),
    description: [nombreUsuarioParaActa(usuario), usuario.email, usuario.role].filter(Boolean).join(" · "),
  }));
  const comisionadosDisponibles = usuariosActivos.filter(usuario =>
    (usuario.role === "ADMIN" || usuario.role === "AUDITOR") && !formData.comisionados.includes(usuario.id));
  const nombreComisionado = (id: number) =>
    comisiones.find(item => item.usuario_id === id)?.nombre ?? nombreUsuarioParaActa(usuarios.find(usuario => usuario.id === id));
  const actualizarComisionados = (ids: number[]) => setFormData(prev => ({
    ...prev, comisionados: ids,
    comisionado: ids.map(id => nombreComisionado(id).trim()).filter(Boolean).join(", "),
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const prepararDatosActa = () => {
    // Solo incluir ID si existe (para edición)
    const payload = {
      ...formData,
      entrante: formData.entrante.trim(),
      saliente: formData.saliente.trim(),
      comisionado: [
        ...(formData.comisionados.length || acta.comisiones?.length
          ? formData.comisionados.map(id => nombreComisionado(id).trim())
          : [formData.comisionado]),
        ...comisionadosManuales.map(item => item.datos.nombre),
      ].filter(Boolean).join(", "),
      comisiones: formData.comisionados.map((usuario_id): ActaComision => {
        const comision = comisiones.find(item => item.usuario_id === usuario_id);
        const mismo_oficio = comision?.mismo_oficio ?? true;
        return {
          usuario_id,
          nombre: nombreComisionado(usuario_id).trim(),
          mismo_oficio,
          oficio_comision: mismo_oficio ? formData.oficio_comision : comision?.oficio_comision || "",
          fecha_oficio_comision: mismo_oficio ? formData.fecha_oficio_comision : comision?.fecha_oficio_comision || "",
        };
      }).concat(comisionadosManuales.map(({ datos }) => ({
        ...datos,
        nombre: datos.nombre?.trim(),
        oficio_comision: datos.mismo_oficio ? formData.oficio_comision : datos.oficio_comision,
        fecha_oficio_comision: datos.mismo_oficio ? formData.fecha_oficio_comision : datos.fecha_oficio_comision,
      }))),
    };
    return acta.id ? { ...payload, id: acta.id } : payload;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unidad_responsable || !formData.entrante.trim() || !formData.saliente.trim()) {
      setErrorSeleccion("Selecciona una unidad responsable y selecciona o captura el nombre de los funcionarios entrante y saliente.");
      return;
    }
    if (formData.comisionados.some(id => !nombreComisionado(id).trim())) {
      setErrorSeleccion("Captura el nombre completo para el acta de cada comisionado seleccionado.");
      return;
    }
    if (capturaComisionadoManual && nombreComisionadoManual.trim()) {
      setErrorSeleccion("Pulsa Agregar comisionado manual para incluir el nombre capturado antes de guardar.");
      return;
    }
    setErrorSeleccion("");
    if (acta.id && !window.confirm("¿Guardar cambios?")) return;

    onSave(prepararDatosActa());
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-xl font-bold text-gray-700">
        {acta.id ? "Editar Acta" : "Nueva Acta"}
      </h2>

      {usuariosCargando && <p role="status" className="text-sm text-gray-600">Cargando usuarios...</p>}
      {usuariosError && <div role="alert" className="text-sm text-red-700">
        {usuariosError} <button type="button" className="underline" onClick={onRetryUsuarios}>Reintentar</button>
      </div>}
      {errorSeleccion && <p role="alert" className="text-sm text-red-700">{errorSeleccion}</p>}

      {/* --- DATOS GENERALES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <ActaSearch
            label="Unidad Responsable"
            value={unidadBusqueda ?? unidades.find(unidad => unidad.id_unidad === Number(formData.unidad_responsable))?.nombre ?? ""}
            options={unidades.map(unidad => ({ id: unidad.id_unidad, label: unidad.nombre }))}
            onChange={value => { setUnidadBusqueda(value); setFormData(prev => ({ ...prev, unidad_responsable: "" })); }}
            onSelect={option => { setUnidadBusqueda(null); setFormData(prev => ({ ...prev, unidad_responsable: option.id })); }}
          />
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
        <h3 className="font-semibold text-gray-600">Comisionados</h3>
        <p className="mt-1 text-sm text-gray-500">Busca y selecciona cada comisionado que desees agregar. Cada uno puede usar el oficio común o uno diferente.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            {capturaComisionadoManual ? <div>
              <label htmlFor="comisionado-manual" className="block text-sm font-medium text-gray-700">Nombre del comisionado manual</label>
              <input id="comisionado-manual" value={nombreComisionadoManual} placeholder="Nombre completo"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                onChange={event => setNombreComisionadoManual(event.target.value)} />
              <Button type="button" variant="outline" className="mt-2" disabled={!nombreComisionadoManual.trim()}
                onClick={agregarComisionadoManual}>Agregar comisionado manual</Button>
            </div> : <ActaSearch label="Comisionados" value={comisionadoBusqueda}
              disabled={usuariosCargando || !!usuariosError}
              options={opcionesUsuario(comisionadosDisponibles)}
              onChange={setComisionadoBusqueda}
              onSelect={option => { actualizarComisionados([...formData.comisionados, option.id]); setComisionadoBusqueda(""); }}
            />}
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={capturaComisionadoManual}
                aria-label="Capturar nombre manualmente de Comisionado"
                onChange={event => { setCapturaComisionadoManual(event.target.checked); setNombreComisionadoManual(""); }} />
              Capturar nombre manualmente
            </label>
            {formData.comisionados.length === 0 && formData.comisionado &&
              <p className="mt-1 text-sm text-gray-600">Registrado anteriormente: {formData.comisionado}</p>}
          </div>
          <div>
            <label htmlFor="oficio-comun" className="block text-sm font-medium text-gray-700">Oficio de comisión común</label>
            <input id="oficio-comun" type="text" name="oficio_comision"
              value={formData.oficio_comision} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1" />
          </div>
          <div>
            <label htmlFor="fecha-oficio-comun" className="block text-sm font-medium text-gray-700">Fecha del oficio común</label>
            <input id="fecha-oficio-comun" type="date" name="fecha_oficio_comision"
              value={formData.fecha_oficio_comision} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1" />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {[
            ...formData.comisionados.map(id => ({ key: `usuario-${id}`, id,
              nombre: usuarios.find(usuario => usuario.id === id)?.username || `Usuario #${id}`,
              comision: comisiones.find(item => item.usuario_id === id) })),
            ...comisionadosManuales.map(item => ({ key: item.key, id: null,
              nombre: item.datos.nombre || "", comision: item.datos })),
          ].map(({ key, id, nombre, comision }) => {
            const actualizar = (cambios: Partial<ActaComision>) => {
              if (id !== null) actualizarComision(id, cambios);
              else setComisionadosManuales(prev => prev.map(item => item.key === key ? { ...item, datos: { ...item.datos, ...cambios } } : item));
            };
            const mismoOficio = comision?.mismo_oficio ?? true;
            return <fieldset key={key} className="rounded-lg border border-gray-200 p-4">
              <legend className="px-1 text-sm font-semibold text-gray-700">{nombre}</legend>
              {id !== null && <div className="mb-3">
                <label htmlFor={`nombre-${key}`} className="block text-sm font-medium text-gray-700">Nombre para el acta de {nombre}</label>
                <input id={`nombre-${key}`} value={nombreComisionado(id)} placeholder="Captura el nombre completo"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  onChange={event => actualizar({ nombre: event.target.value })} />
              </div>}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={mismoOficio}
                    aria-label={`Usar oficio común para ${nombre}`}
                    onChange={event => actualizar({ mismo_oficio: event.target.checked })} />
                  Usar el mismo oficio de comisión común
                </label>
                <button type="button" className="text-sm text-red-700 hover:underline"
                  aria-label={`Quitar comisionado ${nombre}`} onClick={() => { if (id !== null) quitarComisionado(id); else setComisionadosManuales(prev => prev.filter(item => item.key !== key)); }}>Quitar</button>
              </div>
              {mismoOficio ? <p className="mt-2 text-sm text-gray-500">
                Oficio: {formData.oficio_comision || "Sin capturar"} · Fecha: {formData.fecha_oficio_comision || "Sin capturar"}
              </p> : <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor={`oficio-${key}`} className="block text-sm font-medium text-gray-700">Oficio de comisión de {nombre}</label>
                  <input id={`oficio-${key}`} type="text" value={comision?.oficio_comision || ""}
                    onChange={event => actualizar({ oficio_comision: event.target.value })}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
                </div>
                <div>
                  <label htmlFor={`fecha-oficio-${key}`} className="block text-sm font-medium text-gray-700">Fecha del oficio de {nombre}</label>
                  <input id={`fecha-oficio-${key}`} type="date" value={comision?.fecha_oficio_comision || ""}
                    onChange={event => actualizar({ fecha_oficio_comision: event.target.value })}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
                </div>
              </div>}
            </fieldset>;
          })}
        </div>
      </div>

      {/* --- FUNCIONARIO ENTRANTE --- */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-600">Funcionario Entrante</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <ActaPersonSearch label="Funcionario Entrante" nombre={formData.entrante} usuarioId={formData.entrante_id}
            disabled={usuariosCargando || !!usuariosError}
            options={opcionesUsuario(usuariosActivos)}
            onChange={(nombre, id) => setFormData(prev => ({ ...prev, entrante: nombre, entrante_id: id }))}
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
          <ActaPersonSearch label="Funcionario Saliente" nombre={formData.saliente} usuarioId={formData.saliente_id}
            disabled={usuariosCargando || !!usuariosError}
            options={opcionesUsuario(usuariosActivos.filter(usuario => usuario.role === "USER"))}
            onChange={(nombre, id) => setFormData(prev => ({ ...prev, saliente: nombre, saliente_id: id }))}
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
            onBlur={event => {
              if (process.env.NODE_ENV === "development" && event.currentTarget.value.trim()) {
                console.log("[Acta local] Datos preparados para guardar:", JSON.parse(JSON.stringify(prepararDatosActa())));
              }
            }}
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