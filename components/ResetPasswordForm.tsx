"use client";

import React from "react";

type Props = {
  token: string | null;
  uid: string | null;
  newPassword: string;
  confirmPassword: string;
  isSubmitting: boolean;
  onNewPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function ResetPasswordForm({
  token,
  uid,
  newPassword,
  confirmPassword,
  isSubmitting,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: Props) {
  const disabled = !token || !uid || isSubmitting;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#24356B" }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-gray-900">Restablecer contraseña</h1>

        <div className="space-y-2">
          <label className="block text-sm text-gray-700">Nueva contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="********"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-700">Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="********"
            disabled={disabled}
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded-lg px-4 py-2 bg-blue-600 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Enviando..." : "Restablecer contraseña"}
        </button>
      </form>
    </div>
  );
}
