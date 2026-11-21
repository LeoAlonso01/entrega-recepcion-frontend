"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActaUsuario } from "@/components/forms/FormActa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useActaUsuarios(open: boolean) {
  const [usuarios, setUsuarios] = useState<ActaUsuario[]>([]);
  const [usuariosCargando, setUsuariosCargando] = useState(false);
  const [usuariosError, setUsuariosError] = useState("");
  const getUsuarios = useCallback(async () => {
    setUsuariosCargando(true)
    setUsuariosError("")
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (!response.ok) throw new Error("No se pudieron cargar los usuarios")
      const data = await response.json()
      if (!Array.isArray(data)) throw new Error("El catálogo de usuarios no es válido")
      setUsuarios(data)
    } catch (error) {
      setUsuariosError(error instanceof Error ? error.message : "Error al cargar usuarios")
    } finally {
      setUsuariosCargando(false)
    }
  }, [])

  useEffect(() => {
    if (open) void getUsuarios()
  }, [open, getUsuarios])

  return { usuarios, usuariosCargando, usuariosError, getUsuarios };
}
