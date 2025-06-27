// components/NavbarWithBreadcrumb.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import LogoutComponent from "./LogoutComponent";

// Define tus rutas aquí
const navLinks = [
  { name: "Administración",  href:"/dashboard/administracion" },
  { name: "Actas", href: "/dashboard/actas" },
  { name: "Anexos", href: "/dashboard/anexos" },
  { name: "Unidades", href: "/dashboard/unidades" },
];

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { name, href };
  });
  return breadcrumbs;
}

export default function NavbarWithBreadcrumb() {
  // obtener el usuario del localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      // Redirigir al inicio si no hay usuario
      window.location.href = "/";
    }
  }, []);
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="w-full bg-[#24356B] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* NAV */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {/* <img src="/logo-serumich.png" alt="SERUMICH" className="h-10 w-auto" /> */}
            <h1 className="text-xl font-bold text-white">SERUMICH</h1>
          </div>
          <nav className="flex items-center space-x-6">
           
            {navLinks.map(({ name, href }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-white text-sm font-medium hover:text-gray-300 transition ${
                    isActive ? "underline underline-offset-4 text-yellow-300" : ""
                  }`}
                >
                  {name}
                </Link>
              );
            })}
            <LogoutComponent user={JSON.parse(localStorage.getItem("user") || "{}")} />
          </nav>
                
        </div>

        {/* BREADCRUMB */}
        {pathname !== "/" && (
          <nav className="text-sm text-white py-2">
            <ol className="flex space-x-2">
              <li>
                <Link href="/" className="hover:underline text-gray-300">
                  Inicio
                </Link>
              </li>
              {breadcrumbs.map(({ name, href }, idx) => (
                <Fragment key={href}>
                  <li>/</li>
                  <li>
                    <Link
                      href={href}
                      className={`hover:underline ${
                        idx === breadcrumbs.length - 1 ? "text-yellow-300" : "text-gray-300"
                      }`}
                    >
                      {decodeURIComponent(name)}
                    </Link>
                  </li>
                </Fragment>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </header>
  );
}
