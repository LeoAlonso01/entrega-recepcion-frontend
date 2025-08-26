"use client";

import React from 'react';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavbarWithBreadcrumb from '@/components/NavbarBreadcrumb';
import { toast } from 'sonner';
import { set } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AnexoDetail: React.FC = () => {
    const params = useParams();
    const { id } = params as { id: string };

    // Placeholder for fetching anexo data by id
    // Replace with actual data fetching logic
    const [anexo, setAnexo] = React.useState<{ id: string; name: string } | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [usuario, setUsuario] = React.useState<{ id: string; username: string; role: string } | null>(null);
    const [currentUser, setCurrentUser] = React.useState<{ id: string; username: string; role: string } | null>(null);
    const router = useRouter();

    const fetchAnexo = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push('/login');
                return;
            }

            setRefreshing(true);
            const response = await fetch(`${API_URL}/anexos/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Usuario no encontrado");
                }
                if (response.status === 401) {
                    throw new Error("Sesión expirada, por favor inicia sesión nuevamente");
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setUsuario(data);
        } catch (error) {
            console.error("Error:", error);
            toast.error((error as Error).message);
            if ((error as Error).message.includes("Sesión expirada")) {
                localStorage.removeItem("token");
                router.push('/auth/login');
            } else {
                router.push('/dashboard/administracion/usuarios');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Simulate fetch
        const token = localStorage.getItem('token');
        if (!token) {
            // Handle missing token, e.g., redirect to login
            router.push('/login');
            return;
        }

        setCurrentUser(usuario);
        setTimeout(() => {
            setAnexo({ id, name: `Anexo ${id}` });
            setLoading(false);
        }, 500);
        fetchAnexo();
    }, [id]);

    if (loading) {
        return <div>Cargando anexo...</div>;
    }

    if (!anexo) {
        return <div>Anexo no encontrado</div>;
    }

    return (

        <div className='min-h-screen bg-gray-50'>
            {/** Breadcrumbs */}
            <NavbarWithBreadcrumb
                user={currentUser?.username || null}
                role={currentUser?.role || null}
            />

            <h1>Detalle del Anexo</h1>
            <p>ID: {anexo.id}</p>
            <p>Nombre: {anexo.name}</p>
            {/* Add more fields as needed */}
        </div>
    );
};

export default AnexoDetail;