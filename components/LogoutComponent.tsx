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
            <p className="text-white">Bienvenido, {user.username}</p>
            <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="group flex items-center space-x-2 border-gray-800 hover:bg-gray-800 hover:text-white transition-colors duration-300"
            >
                <LogOut className="h-2 w-2 text-gray-800 group-hover:text-white transition-colors duration-300" />
                <span className="text-gray-800 group-hover:text-white transition-colors duration-300">Cerrar sesión</span>
            </Button>
        </div>
    );
}



