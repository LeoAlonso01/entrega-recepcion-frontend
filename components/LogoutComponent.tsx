"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function LogoutComponent({ user }: { user: { username: string } }) {
    const router = useRouter();

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
            <p className="text-gray-800 font-semibold text-sm px-2 py-1 rounded bg-gray-100">
                Bienvenido, {user.username}
            </p>
            <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="group flex items-center gap-2 px-3 py-1 border border-red-500 bg-white text-red-600 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-300 transition-colors duration-200 rounded-md shadow-sm"
            >
                <LogOut className="h-4 w-4 text-red-500 group-hover:text-white transition-colors duration-200" />
                <span className="font-medium group-hover:text-white transition-colors duration-200">Cerrar sesión</span>
            </Button>
        </div>
    );
}



