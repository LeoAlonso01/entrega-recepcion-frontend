"use client"

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | number | null;
  username?: string | null;
  mode: "self" | "admin";
  defaultNewPassword?: string; // for admin resets, default 'user123'
  onSuccess?: () => void;
};

export default function ResetPasswordModal({ open, onOpenChange, userId, username, mode, defaultNewPassword = "user123", onSuccess }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState(defaultNewPassword);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // fetchedUser: authoritative info fetched from backend (/users/me) when opening modal in admin mode
  const [fetchedUser, setFetchedUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open && mode === "admin") {
      setNewPassword(defaultNewPassword);
      setCurrentPassword("");
      setShowPassword(false);
      setPasswordTouched(false);
      // fetch authoritative current user info from backend to confirm role and token validity
      (async () => {
        setCheckingUser(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.warn('ResetPasswordModal: no token available when opening admin modal');
            setFetchedUser(null);
            return;
          }
          const res = await fetch(`${API_URL}/users/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setFetchedUser(data);
            // quick diagnostic log
            console.info('ResetPasswordModal: fetched current user from /users/me', { id: data?.id, role: data?.role });
          } else if (res.status === 401) {
            toast.error('Sesión inválida o expirada. Por favor inicia sesión de nuevo.');
            localStorage.removeItem('token');
            router.push('/auth/login');
          } else if (res.status === 422) {
            // Backend returned Unprocessable Content for '/users/me' (likely no dedicated /me route)
            const text = await res.text().catch(() => '');
            console.warn('ResetPasswordModal: /users/me returned 422, trying fallback fetching by id from JWT', text);

            const token = localStorage.getItem('token');
            if (token) {
              try {
                const payload = token.split('.')[1];
                const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
                const json = decodeURIComponent(atob(base64).split('').map(function(c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(json);
                const candidateId = decoded?.sub || decoded?.user_id || decoded?.id || decoded?.user?.id || null;
                if (candidateId) {
                  const res2 = await fetch(`${API_URL}/users/${candidateId}`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  if (res2.ok) {
                    const data2 = await res2.json();
                    setFetchedUser(data2);
                    console.info('ResetPasswordModal: fetched current user via /users/{id} fallback', { id: data2?.id, role: data2?.role });
                  } else {
                    const t2 = await res2.text().catch(() => '');
                    console.error('ResetPasswordModal: fallback /users/{id} returned', res2.status, t2);
                  }
                } else {
                  console.error('ResetPasswordModal: could not find user id in token payload', decoded);
                }
              } catch (e) {
                console.error('ResetPasswordModal: error decoding token for fallback', e);
              }
            }
          } else {
            const text = await res.text().catch(() => '');
            console.error('ResetPasswordModal: /users/me returned error', res.status, text);
          }
        } catch (e) {
          console.error('ResetPasswordModal: error fetching /users/me', e);
        } finally {
          setCheckingUser(false);
        }
      })();
    }
    if (!open) {
      setCurrentPassword("");
      setNewPassword(defaultNewPassword);
      setShowPassword(false);
      setPasswordTouched(false);
      setLoading(false);
      setFetchedUser(null);
      setCheckingUser(false);
    }
  }, [open, mode, defaultNewPassword, router]);

  const handleSelfChange = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userId) return;

    setPasswordTouched(true);

    if (!currentPassword) {
      toast.error("Debes ingresar tu contraseña actual");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("currentUser");
      let parsedUser: any = null;
      try { parsedUser = storedUser ? JSON.parse(storedUser) : null; } catch (e) { /* ignore */ }

      if (!token) {
        toast.error("Token no encontrado. Inicia sesión de nuevo.");
        console.error("handleSelfChange: no token present", { userId, role: parsedUser?.role });
        router.push("/auth/login");
        return;
      }

      const res = await fetch(`${API_URL}/users/${userId}/change_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        toast.success("Contraseña cambiada. Se cerrará la sesión.");
        // clear token and redirect to login
        localStorage.removeItem("token");
        // small delay to allow toast to show
        setTimeout(() => router.push("/auth/login"), 700);
        onOpenChange(false);
        onSuccess?.();
      } else {
        // try to get detailed message from server
        const text = await res.text().catch(() => "");
        let parsed = null;
        try { parsed = text ? JSON.parse(text) : null; } catch (e) { /* not json */ }
        const serverMessage = parsed?.message || text || null;

        if (res.status === 401) {
          toast.error(serverMessage ? `Unauthorized: ${serverMessage}` : "Credenciales inválidas (401)");
        } else {
          toast.error(serverMessage || `Error al cambiar la contraseña (${res.status})`);
        }

        console.error("handleSelfChange failed", { status: res.status, body: serverMessage, userRole: parsedUser?.role });
      }
    } catch (e) {
      console.error("handleSelfChange exception", e);
      toast.error("Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminReset = async () => {
    if (!userId) return;
    // Check current user's role from localStorage before making call to give faster diagnostics
    const storedUser = localStorage.getItem("currentUser");
    let parsedUser: any = null;
    try { parsedUser = storedUser ? JSON.parse(storedUser) : null; } catch (e) { /* ignore */ }

    // If localStorage doesn't include role, try to decode it from the JWT (token)
    let tokenRole: string | null = null;
    const tokenForRole = localStorage.getItem("token");
    if (!parsedUser?.role && tokenForRole) {
      try {
        const payload = tokenForRole.split('.')[1];
        // fix padding and base64 url -> base64
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(json);
        tokenRole = decoded?.role || decoded?.roles || (decoded?.user && decoded.user.role) || null;
      } catch (e) {
        // ignore decode errors
      }
    }

    const effectiveRole = parsedUser?.role || tokenRole;
    if (effectiveRole !== 'ADMIN') {
      toast.error('No tienes permisos de administrador para resetear la contraseña');
      console.error('handleAdminReset: current user not admin', { userRole: effectiveRole, parsedUser });
      return;
    }

    if (!confirm(`Confirma resetear la contraseña de ${username || userId} a "${newPassword}"`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token no encontrado. Inicia sesión de nuevo.");
        console.error("handleAdminReset: no token present", { userRole: parsedUser?.role });
        router.push("/auth/login");
        return;
      }
      const bodyPayload = { new_password: newPassword, newPassword };
      const res = await fetch(`${API_URL}/admin/users/${userId}/reset_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });
      console.debug('handleAdminReset: sent payload', bodyPayload);

      if (res.ok) {
        toast.success("Contraseña reseteada correctamente.");
        try {
          await navigator.clipboard.writeText(newPassword);
          toast.success("Contraseña copiada al portapapeles");
        } catch (e) {
          // ignore
        }
        onOpenChange(false);
        onSuccess?.();
        // if the admin reset their own password, also remove token and redirect to login
        if (parsedUser && parsedUser.id && parsedUser.id.toString() === userId.toString()) {
          localStorage.removeItem("token");
          setTimeout(() => router.push("/auth/login"), 700);
        }
      } else {
        const text = await res.text().catch(() => "");
        let parsed = null;
        try { parsed = text ? JSON.parse(text) : null; } catch (e) { /* not json */ }
        const serverMessage = parsed?.message || text || null;

        // include fetchedUser info in logs if available
        const roleForLog = fetchedUser?.role || parsedUser?.role || null;

        if (res.status === 401) {
          toast.error(serverMessage ? `Unauthorized: ${serverMessage}` : "Unauthorized (401)");
          console.error('handleAdminReset 401', { status: res.status, body: serverMessage, userRole: roleForLog, fetchedUser });
          // if 401, clear token and redirect to login as likely expired
          localStorage.removeItem('token');
          setTimeout(() => router.push('/auth/login'), 700);
        } else if (res.status === 403) {
          toast.error(serverMessage ? `Forbidden: ${serverMessage}` : "No tienes permisos para resetear la contraseña");
          console.error('handleAdminReset 403', { status: res.status, body: serverMessage, userRole: roleForLog, fetchedUser });
        } else {
          toast.error(serverMessage || `Error al resetear la contraseña (${res.status})`);
          console.error('handleAdminReset error', { status: res.status, body: serverMessage, userRole: roleForLog, fetchedUser });
        }
      }
    } catch (e) {
      console.error("handleAdminReset exception", e);
      toast.error("Error al resetear la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "self" ? "Cambiar contraseña" : `Resetear contraseña de ${username || userId}`}</DialogTitle>
          <DialogDescription>
            {mode === "self" ? "Cambia tu contraseña actual. Se cerrará la sesión después del cambio." : "Se cambiará la contraseña del usuario a la nueva contraseña especificada. Este cambio debe ser comunicada al usuario de manera segura."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {mode === "self" ? (
            <form onSubmit={handleSelfChange} className="space-y-3">
              <div>
                <Label>Contraseña actual</Label>
                <Input type={showPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <Label>Nueva contraseña</Label>
                <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPasswordTouched(true); }} />
                {passwordTouched && newPassword.length > 0 && newPassword.length < 8 && (
                  <p className="text-xs text-red-600 mt-1">La nueva contraseña debe tener al menos 8 caracteres</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <input id="show-pass" type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
                  <label htmlFor="show-pass" className="text-sm text-gray-600">Mostrar contraseña</label>
                </div>

                {/* Hidden submit to allow Enter to submit the form */}
                <button type="submit" style={{ display: 'none' }} aria-hidden />
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Nueva contraseña</Label>
                <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="text-sm text-gray-500">La contraseña por defecto propuesta es <strong>user123</strong>. Puedes cambiarla antes de confirmar.</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            {mode === "self" ? (
              <Button onClick={handleSelfChange} disabled={loading}>{loading ? "Guardando..." : "Cambiar y cerrar sesión"}</Button>
            ) : (
              <Button style={{ backgroundColor: "#24356B", color: "white" }} onClick={handleAdminReset} disabled={loading || checkingUser}>{
              checkingUser ? 'Verificando...' : (loading ? 'Restableciendo...' : 'Resetear')
            }</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
