import { useState, useRef, useEffect } from "react";
import { LogOut, User, Settings } from "lucide-react";

export function UserDropdown({ user, handleLogout }: { user: any; handleLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="User Avatar"
          className="w-8 h-8 rounded-full border-2 border-white"
        />
        <span className="text-white">{user.username}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#24356B] rounded-md shadow-lg py-1 z-50 border border-gray-700">
          <div className="px-4 py-2 text-sm text-white flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </div>
          <div className="px-4 py-2 text-sm text-white flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ajustes
          </div>
          <div className="border-t border-gray-700 my-1"></div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-200 hover:text-red-400 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}