"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push("La contraseña debe tener al menos 8 caracteres");
  if (!/(?=.*[a-z])/.test(password)) errors.push("Debe contener al menos una letra minúscula");
  if (!/(?=.*[A-Z])/.test(password)) errors.push("Debe contener al menos una letra mayúscula");
  if (!/(?=.*\d)/.test(password)) errors.push("Debe contener al menos un número");
  if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?])/.test(password))
    errors.push("Debe contener al menos un carácter especial");
  return errors;
}

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const uid = searchParams.get("uid");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !uid) {
      toast.error("Enlace inválido o incompleto. Solicita un nuevo enlace.");
    }
  }, [token, uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !uid) {
      toast.error("Enlace inválido. Solicita un nuevo correo de recuperación");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Por favor completa los campos de contraseña");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const errors = validatePasswordStrength(newPassword);
    if (errors.length > 0) {
      toast.error(errors.join(". "));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(uid),
          token,
          new_password: newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Contraseña restablecida. Inicia sesión con tu nueva contraseña.");
        // OJO: probablemente aquí quieres ir a /login, no a /reset-password
        router.push("/login");
      } else {
        toast.error(data.detail || "Token inválido o expirado. Solicita un nuevo enlace.");
      }
    } catch {
      toast.error("Error de red. Intenta de nuevo más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResetPasswordForm
      token={token}
      uid={uid}
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      isSubmitting={isSubmitting}
      onNewPasswordChange={setNewPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={handleSubmit}
    />
  );
}
