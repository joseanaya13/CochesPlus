import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const HeroSection = () => {
    return (
        <div className="relative bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-secondary-dark overflow-hidden py-46 opacity-95">
            {/* Capa de fondo absoluta - ajustada para no interferir con la navegación */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block pointer-events-none">
                <div
                    className="h-full w-full bg-cover bg-center opacity-25 dark:opacity-10"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1493238792000-8113da705763?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')" }}
                ></div>
            </div>

            {/* Contenido principal - con z-index ajustado para estar por debajo de la navegación */}
            <div className="max-w-7xl mx-auto relative z-0">
                <div className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl relative animate-slide-up">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4 text-text-light">
                            Tu próximo coche está a un click de distancia
                        </h1>
                        <p className="mt-6 text-xl max-w-3xl text-pretty text-text-light">
                            CochesPlus te ofrece la mejor plataforma para comprar y vender vehículos de forma segura y confiable. Encuentra tu coche ideal entre nuestra
                            amplia selección o publica el tuyo para venderlo rápido.
                        </p>
                        <div className="mt-10 sm:flex gap-3">
                            <div className="rounded-md shadow">
                                <Link to="/coches">
                                    <Button className='!py-4 !px-8' variant={'primary'}>
                                        Buscar coches
                                    </Button>
                                </Link>
                            </div>
                            <div className="mt-3 sm:mt-0">
                                <Link to="/vender">
                                    <Button className='!py-4 !px-8' variant={'primary'}>
                                        Vender mi coche
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Patrón decorativo flotante */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-15">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-light dark:bg-primary mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-primary-light/20 dark:bg-primary/20 mix-blend-multiply filter blur-xl 
                animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/2 w-72 h-72 rounded-full bg-primary/30 dark:bg-primary-light/20 mix-blend-multiply filter blur-xl 
                animate-blob animation-delay-4000"></div>
            </div>
        </div>
    );
};

export default HeroSection;
