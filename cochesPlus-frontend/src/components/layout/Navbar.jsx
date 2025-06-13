import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = () => {
    const { isAuthenticated, user, logout, hasRole } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        if (userMenuOpen) setUserMenuOpen(false);
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
        if (mobileMenuOpen) setMobileMenuOpen(false);
    };

    const closeMenus = () => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    };

    const handleLogout = async () => {
        closeMenus();
        await logout();
    };

    // Verificar si un enlace está activo
    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    // Clase para enlaces activos utilizando nuestros colores de acento
    const getNavLinkClass = (path) => {
        return isActive(path)
            ? "font-medium text-primary relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[2px] after:bg-primary after:scale-x-100 after:origin-bottom-left after:transition-transform"
            : "duration-200 hover:text-primary dark:hover:text-text-light relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[2px] after:bg-primary after:scale-x-0 after:origin-bottom-right after:transition-transform hover:after:scale-x-100 hover:after:origin-bottom-left";
    };

    // Clase para enlaces activos en móvil
    const getMobileLinkClass = (path) => {
        return isActive(path)
            ? "flex p-2 rounded-md text-primary bg-primary-light font-medium transition-all duration-300 hover-lift"
            : "flex p-2 rounded-md text-text-secondary duration-200 hover:bg-primary-light transition-all duration-300 hover-lift";
    };

    const navbarClasses = `bg-primary-light dark:bg-primary-dark text-text-dark dark:text-text-light backdrop-blur-sm ${scrolled ? 'shadow-md border-b border-primary/10 dark:border-primary-light/10' : 'border-transparent'
        } transition-all duration-300 sticky top-0 z-50`;

    return (
        <nav className={navbarClasses}>
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex shrink-0 items-center hover-lift" onClick={closeMenus}>
                            <span className="text-2xl leading-8 font-bold text-primary animate-pulse-subtle">Coches</span>
                            <span className="text-2xl leading-8 font-bold">Plus</span>
                        </Link>
                        <div className="hidden sm:flex sm:gap-8 sm:ml-6">
                            <Link to="/" className={getNavLinkClass('/')}>
                                Inicio
                            </Link>
                            <Link to="/coches" className={getNavLinkClass('/coches')}>
                                Explorar
                            </Link>
                            {/* <Link to="/about" className={getNavLinkClass('/about')}>
                                Nosotros
                            </Link>
                            <Link to="/contacto" className={getNavLinkClass('/contacto')}>
                                Contacto
                            </Link> */}

                            {/* Enlaces para administradores */}
                            {isAuthenticated && hasRole('admin') && (
                                <Link to="/dashboard" className={getNavLinkClass('/dashboard')}>
                                    Dashboard
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:flex sm:items-center sm:gap-4">
                        {/* Botón de cambio de tema */}
                        <ThemeToggle></ThemeToggle>

                        {isAuthenticated ? (
                            <div className="relative bg-primary-dark text-text-light rounded-md p-1 hover-glow">
                                {/* Avatar del usuario y menú desplegable */}
                                <button
                                    className="flex items-center gap-1 dark:text-text-light focus:outline-none transition-all duration-300"
                                    onClick={toggleUserMenu}
                                    aria-expanded={userMenuOpen}
                                    aria-haspopup="true"
                                >
                                    <span className="h-8 w-8 rounded-full dark:bg-primary-light flex items-center justify-center dark:text-text-dark font-medium mr-1 shadow-inner">
                                        {user?.nombre?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                    <span className="hidden md:block">{user?.nombre || 'Usuario'}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Menú desplegable del usuario */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 w-48 rounded-md bg-background-light dark:bg-primary-dark text-text-dark dark:text-text-light shadow-lg z-10 mt-2 py-1 animate-fade">
                                        <div className="px-4 py-2 border-b border-secondary-dark dark:border-secondary-light">
                                            <p className="text-sm leading-5 font-medium">{user?.nombre}</p>
                                            <p className="text-xs leading-4 text-text-secondary truncate">{user?.email}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="text-sm leading-5 px-4 py-2 dark:hover:bg-text-secondary hover:bg-primary-light flex items-center gap-2 transition-colors duration-200"
                                            onClick={closeMenus}
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                            Mi Perfil
                                        </Link>

                                        {hasRole('vendedor') && (
                                            <>
                                                <Link
                                                    to="/vendedor/coches"
                                                    className="text-sm leading-5 px-4 py-2 dark:hover:bg-text-secondary hover:bg-primary-light flex items-center gap-2 transition-colors duration-200"
                                                    onClick={closeMenus}
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                                    </svg>
                                                    Mis Anuncios
                                                </Link>
                                                <Link
                                                    to="/vendedor/publicar"
                                                    className="text-sm leading-5 px-4 py-2 dark:hover:bg-text-secondary hover:bg-primary-light flex items-center gap-2 transition-colors duration-200"
                                                    onClick={closeMenus}
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                    </svg>
                                                    Publicar Anuncio
                                                </Link>
                                            </>
                                        )}

                                        {hasRole('comprador') && (
                                            <>
                                                <Link
                                                    to="/favoritos"
                                                    className="text-sm leading-5 px-4 py-2 dark:hover:bg-text-secondary hover:bg-primary-light flex items-center gap-2 transition-colors duration-200"
                                                    onClick={closeMenus}
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                                    </svg>
                                                    Mis Favoritos
                                                </Link>
                                                <Link
                                                    to="/compras"
                                                    className="text-sm leading-5 px-4 py-2 dark:hover:bg-text-secondary hover:bg-primary-light flex items-center gap-2 transition-colors duration-200"
                                                    onClick={closeMenus}
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                                    </svg>
                                                    Mis Compras
                                                </Link>
                                                <Link
                                                    to="/valoraciones"
                                                    className="text-sm leading-5 px-4 py-2 dark:hover:bg-text-secondary hover:bg-primary-light flex items-center gap-2 transition-colors duration-200"
                                                    onClick={closeMenus}
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                                    </svg>
                                                    Valoraciones
                                                </Link>
                                                <Link
                                                    to="/mensajes"
                                                    className="text-sm leading-5 px-4 py-2 dark:hover:bg-text-secondary hover:bg-primary-light flex items-center gap-2 transition-colors duration-200"
                                                    onClick={closeMenus}
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                                    </svg>
                                                    Mensajes
                                                </Link>
                                            </>
                                        )}

                                        {isAuthenticated && hasRole('admin') && (
                                            <Link to="/dashboard" className={getMobileLinkClass('/dashboard')} onClick={closeMenus}>
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                                </svg>
                                                Dashboard
                                            </Link>
                                        )}

                                        {/* Enlace a Valoraciones */}
                                        <div className="border-t border-secondary-light dark:border-secondary-dark">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left text-sm leading-5 text-error px-4 py-2 hover:bg-primary-light flex items-center gap-2 transition-colors duration-200"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                                </svg>
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login">
                                    <Button variant="primary-invert" className="text-sm hover-lift transition-transform duration-300">
                                        Iniciar sesión
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary-invert" className="text-sm hover-glow transition-all duration-300">
                                        Registrarse
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Botón de menú móvil */}
                    <div className="flex items-center sm:hidden">
                        <button
                            className="inline-flex items-center justify-center p-2 rounded-md hover-glow transition-all duration-300"
                            aria-expanded={mobileMenuOpen}
                            onClick={toggleMobileMenu}
                        >
                            {!mobileMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block sm:hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Panel móvil */}
            {mobileMenuOpen && (
                <div className="block sm:hidden animate-slide-down p-3 bg-primary-light/80 dark:bg-primary-dark/90 backdrop-blur-md border-t border-primary/10 dark:border-primary-light/10">
                    <div className="flex justify-center gap-5 py-3 border-b border-primary-dark/20 dark:border-primary-light/20">
                        <Link to="/" className={getMobileLinkClass('/')} onClick={closeMenus}>
                            <svg className="h-8 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                        </Link>
                        <Link to="/coches" className={getMobileLinkClass('/coches')} onClick={closeMenus}>
                            <svg className="h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </Link>
                        {/* Toggle de tema en el menú móvil */}
                        <ThemeToggle />
                    </div>

                    {/* Sección de usuario */}
                    <div className="py-3">
                        {isAuthenticated ? (
                            <>
                                {/* Perfil del usuario */}
                                <div className="flex items-center px-4">
                                    <div className="flex-shrink-0">
                                        {/* Avatar del usuario */}
                                        <div className="h-10 w-10 rounded-full dark:bg-primary-light bg-primary-dark text-text-light dark:text-primary-dark flex items-center justify-center shadow-md animate-pulse-subtle">
                                            <span className="rounded-full flex items-center justify-center font-medium">
                                                {user?.nombre?.[0]?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base leading-6 font-medium dark:text-text-light text-text-dark">{user?.nombre}</div>
                                        <div className="text-sm leading-5 font-medium text-text-secondary">{user?.email}</div>
                                    </div>
                                </div>

                                {/* Opciones de usuario */}
                                <div className="flex flex-col gap-1 mt-3">
                                    <Link to="/profile" className={getMobileLinkClass('/profile')} onClick={closeMenus}>
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        Mi Perfil
                                    </Link>

                                    {/* Opciones adicionales según roles */}
                                    {isAuthenticated && hasRole('vendedor') && (
                                        <>
                                            <Link to="/vendedor/coches" className={getMobileLinkClass('/vendedor/coches')} onClick={closeMenus}>
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                                </svg>
                                                Mis Anuncios
                                            </Link>
                                            <Link to="/vendedor/publicar" className={getMobileLinkClass('/vendedor/publicar')} onClick={closeMenus}>
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                </svg>
                                                Publicar Anuncio
                                            </Link>
                                            <Link to="/valoraciones" className={getMobileLinkClass('/valoraciones')} onClick={closeMenus}>
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                                </svg>
                                                Valoraciones
                                            </Link>
                                        </>
                                    )}

                                    {isAuthenticated && hasRole('comprador') && (
                                        <>
                                            <Link to="/favoritos" className={getMobileLinkClass('/favoritos')} onClick={closeMenus}>
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                                </svg>
                                                Mis Favoritos
                                            </Link>
                                            <Link to="/compras" className={getMobileLinkClass('/compras')} onClick={closeMenus}>
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                                </svg>
                                                Mis Compras
                                            </Link>
                                            <Link to="/mensajes" className={getMobileLinkClass('/mensajes')} onClick={closeMenus}>
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                                </svg>
                                                Mensajes
                                            </Link>
                                        </>
                                    )}

                                    {isAuthenticated && hasRole('admin') && (
                                        <Link to="/dashboard" className={getMobileLinkClass('/dashboard')} onClick={closeMenus}>
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                            </svg>
                                            Dashboard
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full text-left text-base leading-6 font-medium text-error p-2 hover:bg-primary-light rounded-md transition-all duration-300 hover-lift"
                                    >
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                        </svg>
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 mt-3 px-4">
                                <Link to="/login" onClick={closeMenus} className="block">
                                    <Button variant="primary" fullWidth className="flex items-center justify-center hover-lift transform transition-all duration-300">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                        </svg>
                                        Iniciar sesión
                                    </Button>
                                </Link>
                                <Link to="/register" onClick={closeMenus} className="block">
                                    <Button variant="primary" fullWidth className="flex items-center justify-center hover-glow transform transition-all duration-300">
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                                        </svg>
                                        Registrarse
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
