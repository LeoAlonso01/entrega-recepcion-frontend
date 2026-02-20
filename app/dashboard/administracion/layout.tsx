// app/dashboard/administracion/layout.tsx

import React from "react";

/**
 * The `administracion` segment currently contains a listing page and
 * a nested dynamic route under `usuarios/[id]`. In order for the
 * router to render children of this segment (such as the user detail
 * page) we need to provide a layout. Without a layout the
 * `page.tsx` file is considered a "leaf" and Next will return a 404
 * when attempting to visit deeper paths like
 * `/dashboard/administracion/usuarios/1`.
 *
 * The layout is intentionally minimal – it simply renders the
 * children. Additional structure (headers, sidebars, etc.) can be
 * added later if desired.
 */

export default function AdministracionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
