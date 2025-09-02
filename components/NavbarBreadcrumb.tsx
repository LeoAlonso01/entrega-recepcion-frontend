// components/NavbarWithBreadcrumb.tsx
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

// Intreface para el usuario y su role
interface User {
  username: string;
  role: string;
  unidas_a_cargo: string[];
}

// Rutas de navegación
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

  // detectar el dispositivo 
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
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
  }, [propUser, disableAuthCheck]);

  if (!localUser) {
    return null; // O un loading spinner si prefieres
  }

  if (loading) {
    return (
      <header className="w-full bg-[#24356B] shadow-sm animate-pulse">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* NAV */}
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {/* Logo skeleton */}
              <div className="h-6 w-40 bg-gray-400 rounded-md"></div>
            </div>

            {/* Desktop Navigation skeleton */}
            <nav className="hidden md:flex items-center space-x-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-4 w-20 bg-gray-400 rounded"
                ></div>
              ))}
              {/* User skeleton */}
              <div className="h-8 w-8 bg-gray-400 rounded-full"></div>
            </nav>

            {/* Mobile Menu Button skeleton */}
            <div className="md:hidden">
              <div className="h-6 w-6 bg-gray-400 rounded"></div>
            </div>
          </div>

          {/* BREADCRUMB skeleton */}
          <nav className="text-sm text-white py-2">
            <div className="flex space-x-2">
              <div className="h-4 w-16 bg-gray-400 rounded"></div>
              <div className="h-4 w-4 bg-gray-400 rounded"></div>
              <div className="h-4 w-24 bg-gray-400 rounded"></div>
              <div className="h-4 w-4 bg-gray-400 rounded"></div>
              <div className="h-4 w-32 bg-gray-400 rounded"></div>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-[#24356B] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* NAV */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">SERUMICH V2</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
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

          {/* Mobile Menu Button */}

          <button
            className="md:hidden text-white focus:outline-none"
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
          {/* user wellcome and logout mobile  */}

        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 flex flex-col space-y-3">
            {navLinks.map(({ name, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-white text-sm font-medium hover:text-gray-300 transition ${isActive(href) ? "underline underline-offset-4 text-yellow-300" : ""
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {name}
              </Link>
            ))}
            <LogoutComponent user={localUser} />
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
  );
}