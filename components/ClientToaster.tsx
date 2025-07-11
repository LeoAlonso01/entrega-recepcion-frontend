"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

export default function ClientToaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      toastOptions={{
        style: {
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "0.875rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        classNames: {
          toast: "!bg-background !text-foreground", // Estilo base
          success: "!bg-green-600 !text-white",     // Personalizado para success
          error: "!bg-red-600 !text-white",        // Personalizado para error
          warning: "!bg-yellow-600 !text-white",    // Personalizado para warning
          info: "!bg-blue-600 !text-white",         // Personalizado para info
          loading: "!bg-gray-600 !text-white",      // Personalizado para loading
        },
      }}
    />
  );
}