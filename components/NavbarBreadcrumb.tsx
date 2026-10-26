// components/NavbarWithBreadcrumb.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import LogoutComponent from "./LogoutComponent";
import { LayoutDashboard, FileText, Paperclip, Building2, LogOut, UserRound } from "lucide-react";

// Tipos
interface NavLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

// Intreface para el usuario y su role
interface User {
  id?: number;
  username: string;
  role: string;
  unidas_a_cargo?: string[];
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
    { name: "AuditPlatform", href: "/dashboard/auditplatform", icon: IconMap["Administración"] },
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

function getBreadcrumbs(pathname: string, role: string | null) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments
    .map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { name, href };
    })
    .filter((crumb) => {
      const segment = crumb.href.split("/").pop()!.toLowerCase();
      if (["dashboard", "admin"].includes(segment)) return false;
      if (segment === "administracion" && role?.trim().toUpperCase() !== "ADMIN") return false;
      return true;
    });
  return breadcrumbs;
}


interface NavbarWithBreadcrumbProps {
  user?: User | string | null;
  role?: string | null;
  disableAuthCheck?: boolean; // Para pruebas
}

export default function NavbarWithBreadcrumb({ user: propUser, role: propRole, disableAuthCheck = false }: NavbarWithBreadcrumbProps) {
  const [role, setRole] = useState<string | null>(null);
  // Verificar si hay usuario autenticado
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname, role);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  // funcion para usar getnavbyrole basado en el rol obtenido
  const displayedNavLinks = role ? getNavLinksByRole(role) : [];
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileNavLinks = role?.trim().toUpperCase() === "ADMIN"
    ? [
        ...displayedNavLinks.filter(({ href }) => href !== "/dashboard/auditplatform"),
        ...(localUser?.id !== undefined
          ? [{ name: "Mi perfil", href: `/dashboard/administracion/usuarios/${localUser.id}`, icon: <UserRound size={20} /> }]
          : []),
      ]
    : role?.trim().toUpperCase() === "USER"
      ? [
          ...(localUser?.id !== undefined
            ? [{ name: "Mi perfil", href: `/dashboard/administracion/usuarios/${localUser.id}`, icon: <UserRound size={20} /> }]
            : []),
          ...displayedNavLinks,
        ]
      : displayedNavLinks;

  // Detectar si es móvil (solo en cliente)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const body = document.body;
    const originalHeight = body.style.height;
    const originalMinHeight = body.style.minHeight;
    const originalPaddingBottom = body.style.paddingBottom;

    if (isMobile) {
      body.style.height = "auto";
      body.style.minHeight = "100vh";
      body.style.paddingBottom = "calc(7rem + env(safe-area-inset-bottom))";
    }

    return () => {
      body.style.height = originalHeight;
      body.style.minHeight = originalMinHeight;
      body.style.paddingBottom = originalPaddingBottom;
    };
  }, [isMobile]);

  // Verificar si hay usuario autenticado
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const userRole = localStorage.getItem("role");
    const parsedUser = userData ? JSON.parse(userData) : null;

    // Some screens pass only the username. Use the complete stored user in that case,
    // so the welcome link and label have the same data as on /dashboard.
    const currentUser = propUser && typeof propUser === "object" ? propUser : parsedUser;
    setLocalUser(currentUser);

    if (!currentUser && !disableAuthCheck && !propUser) {
      window.location.href = "/";
      return;
    }

    setRole(propRole || userRole || currentUser?.role || null);
    setLoading(false);
  }, [propUser, propRole, disableAuthCheck]);

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
    <nav aria-label="Navegación principal móvil" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className={`pointer-events-auto relative mx-auto flex min-h-[3.75rem] items-center rounded-full border border-white/10 bg-[#24356B] px-2 text-white shadow-[0_8px_28px_rgba(36,53,107,0.32)] ${role?.trim().toUpperCase() === "USER" ? "w-[min(18rem,100%)] justify-center" : "w-full max-w-lg justify-around"}`}>
        {mobileNavLinks.map(({ name, href, icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={name}
            aria-current={isActive(href) ? "page" : undefined}
            title={name}
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 text-center transition-colors ${isActive(href) || (role?.trim().toUpperCase() === "USER" && href === "/dashboard/anexos")
                ? "bg-white/10 text-white"
                : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors [&>svg]:h-5 [&>svg]:w-5 ${isActive(href) || (role?.trim().toUpperCase() === "USER" && href === "/dashboard/anexos") ? "bg-[#B59E60] text-[#24356B]" : "text-white/90"}`}>{icon}</span>
            <span className="w-full truncate text-[10px] font-semibold leading-tight">
              {href.endsWith("/administracion") ? "Admin" : name}
            </span>
          </Link>
        ))}
        {/* Botón de logout en bottom nav */}
        <button
          type="button"
          aria-label="Salir"
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            window.location.href = "/";
          }}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 text-center text-white/65 transition-colors hover:bg-white/10 hover:text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full [&>svg]:h-5 [&>svg]:w-5"><LogOut aria-hidden="true" /></span>
          <span className="w-full truncate text-[10px] font-semibold leading-tight">Salir</span>
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
            <nav aria-label="Ruta de navegación" className="max-w-full overflow-x-auto border-t border-gray-600 py-2 text-xs text-white sm:text-sm">
              <ol className="flex w-max min-w-full whitespace-nowrap space-x-2 pb-1">
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

    </>
  );
}
