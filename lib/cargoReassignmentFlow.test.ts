const API_URL = "http://localhost:8000";

type Acta = {
  id: number;
  unidad_responsable: number;
  folio?: string;
  estado?: string;
};

type CargoActual = {
  id: number;
  cargo_id: number;
  user_id: number;
  unidad_responsable_id: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  motivo?: string;
};

type UsuarioConCargos = {
  id: number;
  username: string;
  cargos_actuales?: CargoActual[];
};

const getActas = async (): Promise<Acta[]> => {
  const response = await fetch(`${API_URL}/actas`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Error al obtener actas");
  }
  return response.json();
};

const getUsuario = async (userId: number): Promise<UsuarioConCargos> => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Error al obtener usuario");
  }
  return response.json();
};

const desasignarCargo = async (histId: number) => {
  const response = await fetch(`${API_URL}/cargos/desasignar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hist_id: histId }),
  });
  if (!response.ok) {
    throw new Error("Error al cerrar la asignación de cargo");
  }
  return response.json();
};

const asignarCargo = async (payload: {
  cargo_id: number;
  user_id: number;
  unidad_responsable_id: number;
  motivo: string | null;
}) => {
  const response = await fetch(`${API_URL}/cargos/asignar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.status === 409) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Ya existe una asignación activa para ese cargo y unidad.");
  }

  if (!response.ok) {
    throw new Error("No se pudo asignar el cargo");
  }

  return response.json();
};

const validarReasignacion = async (userId: number, cargoId: number, unidadId: number) => {
  const actas = await getActas();
  const tieneActa = actas.some((acta) => acta.unidad_responsable === unidadId);
  if (!tieneActa) {
    throw new Error("No existe un acta de entrega-recepción para la unidad responsable seleccionada.");
  }

  const usuario = await getUsuario(userId);
  const cargoActivo = usuario.cargos_actuales?.find(
    (cargo) => cargo.cargo_id === cargoId && cargo.unidad_responsable_id === unidadId && cargo.fecha_fin === null
  );

  if (cargoActivo) {
    await desasignarCargo(cargoActivo.id);
  }

  return asignarCargo({
    cargo_id: cargoId,
    user_id: userId,
    unidad_responsable_id: unidadId,
    motivo: "Reasignación validada con acta",
  });
};

describe("Validación de flujo de reasignación de cargo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("cierra la asignación previa y reasigna el cargo solo si existe un acta para la unidad", async () => {
    const mockedFetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, unidad_responsable: 301, folio: "A-001" },
          { id: 2, unidad_responsable: 212, folio: "A-002" },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          username: "Dani Alonso",
          cargos_actuales: [
            {
              id: 15,
              cargo_id: 2,
              user_id: 1,
              unidad_responsable_id: 301,
              fecha_inicio: "2026-08-06T19:54:39.683729",
              fecha_fin: null,
              motivo: "Asignación desde panel de administración",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 99 }) });

    (global as any).fetch = mockedFetch;

    const result = await validarReasignacion(1, 2, 301);

    expect(result).toEqual({ id: 99 });
    expect(mockedFetch).toHaveBeenCalledTimes(4);
    expect(mockedFetch.mock.calls[0][0]).toBe(`${API_URL}/actas`);
    expect(mockedFetch.mock.calls[1][0]).toBe(`${API_URL}/users/1`);
    expect(mockedFetch.mock.calls[2][0]).toBe(`${API_URL}/cargos/desasignar`);
    expect(mockedFetch.mock.calls[3][0]).toBe(`${API_URL}/cargos/asignar`);
    expect(JSON.parse(mockedFetch.mock.calls[3][1]?.body || "{}")).toEqual({
      cargo_id: 2,
      user_id: 1,
      unidad_responsable_id: 301,
      motivo: "Reasignación validada con acta",
    });
  });

  it("rechaza la reasignación si no existe acta para la unidad responsable", async () => {
    const mockedFetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, unidad_responsable: 212, folio: "A-002" },
      ],
    });

    (global as any).fetch = mockedFetch;

    await expect(validarReasignacion(1, 2, 301)).rejects.toThrow(
      "No existe un acta de entrega-recepción para la unidad responsable seleccionada."
    );

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch.mock.calls[0][0]).toBe(`${API_URL}/actas`);
  });

  it("reanuda la reasignación directamente si no hay cargo activo idéntico en la unidad", async () => {
    const mockedFetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, unidad_responsable: 301, folio: "A-001" },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          username: "Dani Alonso",
          cargos_actuales: [
            {
              id: 14,
              cargo_id: 3,
              user_id: 1,
              unidad_responsable_id: 301,
              fecha_inicio: "2026-08-01T10:10:10.000Z",
              fecha_fin: null,
              motivo: "Cargo diferente",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 100 }) });

    (global as any).fetch = mockedFetch;

    const result = await validarReasignacion(1, 2, 301);

    expect(result).toEqual({ id: 100 });
    expect(mockedFetch).toHaveBeenCalledTimes(3);
    expect(mockedFetch.mock.calls[2][0]).toBe(`${API_URL}/cargos/asignar`);
  });
});
