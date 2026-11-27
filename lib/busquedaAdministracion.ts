const normalizarBusqueda = (valor: unknown) => String(valor ?? "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");

export function coincideBusqueda(busqueda: string, valores: unknown[]): boolean {
  const texto = valores.map(normalizarBusqueda).join(" ");
  return normalizarBusqueda(busqueda).split(" ").every(termino => texto.includes(termino));
}

interface UsuarioBuscable {
  username?: string | null;
  email?: string | null;
  role?: string | null;
  unidad_responsable?: { nombre?: string | null } | null;
  cargos_actuales?: Array<{ cargo?: { nombre?: string | null }; nombre?: string | null }> | null;
}

const nombresRol: Record<string, string> = { ADMIN: "Administrador", AUDITOR: "Auditor", USER: "Usuario" };

export function coincideUsuario(usuario: UsuarioBuscable, busqueda: string): boolean {
  return coincideBusqueda(busqueda, [
    usuario.username,
    usuario.email,
    usuario.unidad_responsable?.nombre,
    ...(usuario.cargos_actuales ?? []).map(cargo => cargo.cargo?.nombre || cargo.nombre),
    usuario.role,
    nombresRol[usuario.role ?? ""],
  ]);
}

export function coincideUnidad(unidad: { nombre?: string | null; responsable?: { username?: string | null } | null }, busqueda: string): boolean {
  return coincideBusqueda(busqueda, [unidad.nombre, unidad.responsable?.username || "Sin asignar"]);
}
