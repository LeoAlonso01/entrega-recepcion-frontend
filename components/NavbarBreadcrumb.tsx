// components/NavbarWithBreadcrumb.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import LogoutComponent from "./LogoutComponent";
import path from "path";
import { LayoutDashboard, FileText, Paperclip, Building2, LogOut } from "lucide-react";

// Tipos
interface NavLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

// Intreface para el usuario y su role
interface User {
  username: string;
  role: string;
  unidas_a_cargo: string[];
}

// Mapeo de íconos por nombre
const IconMap = {
  Administración: <LayoutDashboard size={20} />,
  Actas: <FileText size={20} />,
  Anexos: <Paperclip size={20} />,
  Unidades: <Building2 size={20} />,
};

// Rutas base (sin el [id])
const baseNavLinks: Record<string, NavLink[]> = {
  ADMIN: [
    { name: "Administración", href: "/dashboard/administracion", icon: IconMap["Administración"] },
    { name: "Actas", href: "/dashboard/actas", icon: IconMap["Actas"] },
    { name: "Unidades", href: "/dashboard/unidades", icon: IconMap["Unidades"] },
    { name: "Anexos", href: "/dashboard/anexos", icon: IconMap["Anexos"] },
  ],
  USER: [
    { name: "Anexos", href: "/dashboard/anexos", icon: IconMap["Anexos"] },
  ],
  AUDITOR: [
    { name: "Anexos", href: "/dashboard/anexos", icon: IconMap["Anexos"] },
    { name: "Actas", href: "/dashboard/actas", icon: IconMap["Actas"] },
  ],
};

// Obtener rutas por rol
const getNavLinksByRole = (role: string): NavLink[] => {
  return baseNavLinks[role] || [];
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments
    .map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { name, href };
    })
    .filter((crumb) => !["dashboard", "admin"].includes(crumb.href.split("/").pop()!));
  return breadcrumbs;
}


interface NavbarWithBreadcrumbProps {
  user?: string | null;
  role?: string | null;
  disableAuthCheck?: boolean; // Para pruebas
}

export default function NavbarWithBreadcrumb({ user: propUser, disableAuthCheck = false }: NavbarWithBreadcrumbProps) {
  const [role, setRole] = useState<string | null>(null);
  // Verificar si hay usuario autenticado
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const isActive = (href: string) => pathname === href;
  // funcion para usar getnavbyrole basado en el rol obtenido
  const displayedNavLinks = role ? getNavLinksByRole(role) : [];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Detectar si es móvil (solo en cliente)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Usa 768px como breakpoint para móvil
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Verificar si hay usuario autenticado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user");
      const userRole = localStorage.getItem("role");
      const parsedUser = userData ? JSON.parse(userData) : null;

      // Usar el prop si existe, sino usar el localStorage
      const currentUser = propUser || parsedUser;
      setLocalUser(propUser || parsedUser);

      // Solo acceder a localStorage en el cliente
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem("user");
        const userRole = localStorage.getItem("role");
        const parsedUser = userData ? JSON.parse(userData) : null;

        // Usar el prop si existe, sino usar el localStorage
        const currentUser = propUser || parsedUser;
        setLocalUser(propUser || parsedUser);

        console.log("Current User:", currentUser);

        if (!currentUser && !disableAuthCheck && !propUser) {
          window.location.href = "/";
          return;
        }

        // Determinar el rol
        const currentRole = userRole || (parsedUser?.role ? parsedUser.role : null);
        setRole(currentRole);
        setLoading(false);
      }
    }
  }, [propUser, disableAuthCheck]);

  if (loading) {
    return (
      <div className="w-full bg-[#24356B] shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="h-6 w-40 bg-gray-400 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!localUser) return null;

  // Bottom Navigation (solo en dispositivos ≤ 1024px)
  const BottomNavigation = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around">
        {displayedNavLinks.map(({ name, href, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center py-3 px-4 text-xs font-medium transition ${isActive(href)
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {icon}
            <span className="mt-1">{name}</span>
          </Link>
        ))}
        {/* Botón de logout en bottom nav */}
        <button
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            window.location.href = "/";
          }}
          className="flex flex-col items-center py-3 px-4 text-xs text-gray-500 hover:text-red-600"
        >
          <LogOut size={20} />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );


  return (
    <>
      <header className="w-full bg-[#24356B] shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Barra superior: Logo y menú hamburguesa (móvil/tablet) */}
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">SERUMICH V2</h1>
            </div>

            {/* Menú hamburguesa para desktop/tablet (solo si no es móvil con bottom nav) */}
            {!isMobile && (
              <button
                className="text-white focus:outline-none md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
          {/* Menú superior (solo desktop) - Alineado a la derecha */}
          <div className="hidden md:flex items-center justify-end flex-1 space-x-6 pb-2">
            <nav className="flex items-center space-x-6">
              {displayedNavLinks.map(({ name, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-white text-sm font-medium hover:text-gray-300 transition ${isActive(href)
                      ? "underline underline-offset-4 text-yellow-300"
                      : ""
                    }`}
                >
                  {name}
                </Link>
              ))}
              <LogoutComponent user={localUser} />
            </nav>
          </div>

          {/* Menú desplegable (tablet/móvil) - solo si no usamos bottom nav */}
          {isMenuOpen && !isMobile && (
            <nav className="md:hidden py-4 flex flex-col space-y-3 border-t border-gray-600">
              {displayedNavLinks.map(({ name, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-white text-sm font-medium hover:text-gray-300 pl-2 ${isActive(href)
                      ? "underline underline-offset-4 text-yellow-300"
                      : ""
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {name}
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-600">
                <LogoutComponent user={localUser} />
              </div>
            </nav>
          )}

          {/* Breadcrumb (ocultar en móvil si lo deseas) */}
          {pathname !== "/dashboard" && (
            <nav className="text-sm text-white py-2 border-t border-gray-600 pt-2">
              <ol className="flex space-x-2">
                <li>
                  <Link href="/dashboard" className="hover:underline text-gray-300">
                    Inicio
                  </Link>
                </li>
                {breadcrumbs.map(({ name, href }, idx) => (
                  <Fragment key={href}>
                    <li>/</li>
                    <li>
                      <Link
                        href={href}
                        className={`hover:underline ${idx === breadcrumbs.length - 1
                            ? "text-yellow-300"
                            : "text-gray-300"
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

      {/* Bottom Navigation para móviles */}
      {isMobile && <BottomNavigation />}

      {/* Espacio para que el bottom nav no tape contenido */}
      {isMobile && <div className="h-16"></div>}
    </>
  );
}