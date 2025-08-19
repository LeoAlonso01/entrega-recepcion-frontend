'use client'

import React, { useState } from "react";

const RecuperacionContraseña: React.FC = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        if (!username) {
            setError("Por favor, ingresa tu nombre de usuario.");
            return;
        }
        
        if (!password || !confirmPassword) {
            setError("Por favor, completa ambos campos de contraseña.");
            return;
        }
        
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Aquí iría la lógica para enviar la nueva contraseña al backend
            // Simulamos una llamada a la API con un timeout
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // En una implementación real, aquí llamarías a tu API:
            // const response = await fetch(`/api/users/${userId}/change-password`, {
            //   method: 'PUT',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ current_password: "...", new_password: password })
            // });
            
            setSuccess("¡Contraseña actualizada correctamente!");
            setPassword("");
            setConfirmPassword("");
            setUsername("");
        } catch (err) {
            setError("Error al actualizar la contraseña. Intenta nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>SERUMICH V2</h2>
                    <p style={styles.subtitle}>Recuperación de Contraseña</p>
                </div>
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Nombre de usuario <span style={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Ingresa tu nombre de usuario"
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Nueva contraseña <span style={styles.required}>*</span>
                        </label>
                        <div style={styles.passwordContainer}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={styles.input}
                                placeholder="Mínimo 6 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? (
                                    <svg style={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg style={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Confirmar contraseña <span style={styles.required}>*</span>
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Repite tu contraseña"
                        />
                    </div>
                    
                    {error && <div style={styles.errorMessage}>{error}</div>}
                    {success && <div style={styles.successMessage}>{success}</div>}
                    
                    <button 
                        type="submit" 
                        style={isLoading ? {...styles.button, ...styles.buttonLoading} : styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? "Procesando..." : "Cambiar"}
                    </button>
                </form>
                
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        ¿Recordaste tu contraseña? <a href="/" style={styles.link}>Inicia sesión</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Estilos para el componente con la paleta de colores del login
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#24356B', // Azul oscuro del fondo
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        width: '100%',
        maxWidth: '450px',
        overflow: 'hidden'
    },
    header: {
        textAlign: 'center' as const,
        backgroundColor: '#B59E60', // Dorado del header
        color: 'white',
        padding: '24px'
    },
    title: {
        margin: '0 0 8px 0',
        fontSize: '24px',
        fontWeight: '700'
    },
    subtitle: {
        margin: '0',
        fontSize: '16px',
        opacity: 0.9
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        padding: '24px'
    },
    inputGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#2d3748',
        fontWeight: '500',
        fontSize: '14px'
    },
    required: {
        color: '#751518' // Rojo oscuro para el asterisco
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '16px',
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none'
    },
    passwordContainer: {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center'
    },
    eyeButton: {
        position: 'absolute' as const,
        right: '10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#718096'
    },
    eyeIcon: {
        width: '20px',
        height: '20px'
    },
    button: {
        backgroundColor: '#751518', // Rojo oscuro del botón
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '14px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        marginTop: '10px'
    },
    buttonLoading: {
        backgroundColor: '#a0aec0',
        cursor: 'not-allowed'
    },
    errorMessage: {
        backgroundColor: '#fed7d7',
        color: '#c53030',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '14px'
    },
    successMessage: {
        backgroundColor: '#c6f6d5',
        color: '#2d7843',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '14px'
    },
    footer: {
        textAlign: 'center' as const,
        padding: '16px 24px 24px',
        borderTop: '1px solid #e2e8f0'
    },
    footerText: {
        color: '#718096',
        margin: '0',
        fontSize: '14px'
    },
    link: {
        color: '#751518', // Rojo oscuro para el enlace
        textDecoration: 'none',
        fontWeight: '600'
    }
};

// Aplicar estilos de focus a los inputs
const addFocusStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        input:focus {
            border-color: #B59E60 !important;
            box-shadow: 0 0 0 3px rgba(181, 158, 96, 0.2) !important;
        }
        button:hover {
            background-color: #97191d !important;
        }
        a:hover {
            text-decoration: underline !important;
        }
    `;
    document.head.appendChild(style);
};

// Ejecutar después de que el componente se monte
if (typeof window !== 'undefined') {
    addFocusStyles();
}

export default RecuperacionContraseña;