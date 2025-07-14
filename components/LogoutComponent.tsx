import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Eye } from "lucide-react";
import { User } from "lucide-react";


interface usuario {
  id: number
  username: string
  email: string
  role: "USER" | "ADMIN" | "AUDITOR"
  is_deleted?: boolean // Optional property for soft delete
  created_at: string
}

// Componente de cierre de sesión con confirmación


export default function LogoutComponent({ user }: { user: { username: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Has cerrado sesión correctamente.");
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-2">
      {/* Mostrar el nombre de usuario solo en desktop */}
      <Link
        href={`/dashboard/administracion/usuarios/${(user as usuario).id}`}
        className="hidden md:flex items-center gap-2 text-gray-800 font-semibold text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <User className="h-4 w-4" />
        <span>Bienvenido, {(user as usuario).username}</span>
      </Link>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* Botón para desktop */}
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 px-3 py-1 border border-red-500 bg-white text-red-600 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-300 transition-colors duration-200 rounded-md shadow-sm"
          >
            <LogOut className="h-4 w-4 text-red-500 group-hover:text-white transition-colors duration-200" />
            <span className="font-medium group-hover:text-white transition-colors duration-200">Cerrar sesión</span>
          </Button>
        </DialogTrigger>

        {/* Botón para móvil (más pequeño, solo icono) */}
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden flex items-center justify-center p-1 border border-red-500 bg-white text-red-600 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-300 transition-colors duration-200 rounded-md shadow-sm"
          >
            <LogOut className="h-4 w-4 text-red-500 hover:text-white transition-colors duration-200" />
          </Button>
        </DialogTrigger>

        {/* Diálogo de confirmación */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¿Estás seguro de cerrar sesión?</DialogTitle>
            <DialogDescription>
              Cualquier cambio no guardado podría perderse. Asegúrate de haber guardado todo antes de salir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}