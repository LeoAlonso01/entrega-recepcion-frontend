"use client";

import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#24356B" }}
        >
          Cargando...
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
