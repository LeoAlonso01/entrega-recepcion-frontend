"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import LogoutComponent from "./LogoutComponent";
import path from "path";

// Tipos
interface NavLink {
  name: string;
  href: string;
  icon?: string;
}

// Interface para el usuario y su role
interface User {
  username: string;
  role: string;
  unidas_a_cargo: string[];
}

// Rutas de navegación con íconos
const navLinks: NavLink[] = [
  { name: "Administración", href: "/dashboard/administracion", icon: "📊" },
  { name: "Actas", href: "/dashboard/actas", icon: "📝" },
  { name: "Anexos", href: "/dashboard/anexos", icon: "📎" },
  { name: "Unidades", href: "/dashboard/unidades", icon: "🏢" },
  { name: "Detalles", href: path.join("/dashboard/administracion/usuarios", "[id]"), icon: "👤" }
];

// función que revisa el rol y muestra las rutas correspondientes
const getNavLinksByRole = (role: string): NavLink[] => {
  switch (role) {
    case "ADMIN":
      return [
        { name: "Administración", href: "/dashboard/administracion", icon: "📊" },
        { name: "Actas", href: "/dashboard/actas", icon: "📝" },
        { name: "Unidades", href: "/dashboard/unidades", icon: "🏢" },
        { name: "Anexos", href: "/dashboard/anexos", icon: "📎" },
      ];
    case "USER":
      return [{ name: "Anexos", href: "/dashboard/anexos", icon: "📎" }];
    case "AUDITOR":
      return [
        { name: "Anexos", href: "/dashboard/anexos", icon: "📎" },
        { name: "Actas", href: "/dashboard/actas", icon: "📝" },
      ];
    default:
      return [];
  }
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { name, href };
  });
  return breadcrumbs;
}

interface NavbarWithBreadcrumbProps {
  user?: string | null;
  role?: string | null;
  disableAuthCheck?: boolean;
}

export default function NavbarWithBreadcrumb({ user: propUser, disableAuthCheck = false }: NavbarWithBreadcrumbProps) {
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const isActive = (href: string) => pathname === href;
  const displayedNavLinks = role ? getNavLinksByRole(role) : [];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es dispositivo móvil/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Verificar si hay usuario autenticado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user");
      const userRole = localStorage.getItem("role");
      const parsedUser = userData ? JSON.parse(userData) : null;
      
      const currentUser = propUser || parsedUser;
      setLocalUser(propUser || parsedUser);

      if (!currentUser && !disableAuthCheck && !propUser) {
        window.location.href = "/";
        return;
      }

      const currentRole = userRole || (parsedUser?.role ? parsedUser.role : null);
      setRole(currentRole);
      setLoading(false);
    }
  }, [propUser, disableAuthCheck]);

  if (!localUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full bg-[#24356B] shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="h-6 w-40 bg-gray-400 rounded-md animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-400 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="w-full bg-[#24356B] shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* NAV */}
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">SERUMICH V2</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {displayedNavLinks.map(({ name, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-white text-sm font-medium hover:text-gray-300 transition ${isActive(href) ? "underline underline-offset-4 text-yellow-300" : ""
                    }`}
                >
                  {name}
                </Link>
              ))}
              <LogoutComponent user={localUser} />
            </nav>

            {/* Mobile Menu Button - Solo se muestra en tablets (md) cuando no usamos bottom nav */}
            <button
              className="lg:hidden text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
          </div>

          {/* Mobile Menu para tablets */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden py-4 flex flex-col space-y-3">
              {displayedNavLinks.map(({ name, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center text-white text-sm font-medium hover:text-gray-300 transition ${isActive(href) ? "underline underline-offset-4 text-yellow-300" : ""
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {icon && <span className="mr-2">{icon}</span>}
                  {name}
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-600">
                <LogoutComponent user={localUser} />
              </div>
            </nav>
          )}

          {/* BREADCRUMB */}
          {pathname !== "/" && (
            <nav className="text-sm text-white py-2">
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

      {/* Bottom Navigation para móviles y tablets */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#24356B] border-t border-gray-600 lg:hidden z-50">
          <div className="flex justify-around items-center py-2">
            {displayedNavLinks.slice(0, 4).map(({ name, href, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center p-2 text-xs ${isActive(href) ? "text-yellow-300" : "text-white"}`}
              >
                <span className="text-lg">{icon || "•"}</span>
                <span className="mt-1">{name}</span>
              </Link>
            ))}
            {displayedNavLinks.length > 4 && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex flex-col items-center p-2 text-xs text-white"
              >
                <span className="text-lg">⋯</span>
                <span className="mt-1">Más</span>
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Espacio para evitar que el contenido quede detrás de la bottom nav */}
      {isMobile && <div className="h-16"></div>}
    </>
  );
}