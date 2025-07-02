// components/NavbarWithBreadcrumb.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import LogoutComponent from "./LogoutComponent";

// Tipos
interface NavLink {
  name: string;
  href: string;
}

// Rutas de navegación
const navLinks: NavLink[] = [
  { name: "Administración", href: "/dashboard/administracion" },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Verificar si hay usuario autenticado
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) window.location.href = "/";
  }, []);

  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const isActive = (href: string) => pathname === href;

  return (
    <header className="w-full bg-[#24356B] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* NAV */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">SERUMICH</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ name, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-white text-sm font-medium hover:text-gray-300 transition ${
                  isActive(href) ? "underline underline-offset-4 text-yellow-300" : ""
                }`}
              >
                {name}
              </Link>
            ))}
            <LogoutComponent user={JSON.parse(localStorage.getItem("user") || "{}")} />
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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 flex flex-col space-y-3">
            {navLinks.map(({ name, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-white text-sm font-medium hover:text-gray-300 transition ${
                  isActive(href) ? "underline underline-offset-4 text-yellow-300" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {name}
              </Link>
            ))}
            <LogoutComponent user={JSON.parse(localStorage.getItem("user") || "{}")} />
          </nav>
        )}

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
                        idx === breadcrumbs.length - 1
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