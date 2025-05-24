import React from 'react';
import { Link } from 'react-router-dom';
import CarCard from './CarCard';
import ScrollReveal from '../utils/ScrollReveal';

const FeaturedCars = () => {
    const featuredCars = [
        {
            id: 1,
            title: 'BMW Serie 3',
            year: 2021,
            price: 45900,
            mileage: 25000,
            location: 'Madrid',
            image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            verified: true,
            featured: true
        },
        {
            id: 2,
            title: 'Audi A4',
            year: 2020,
            price: 39500,
            mileage: 35000,
            location: 'Barcelona',
            image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            verified: true,
            featured: true
        },
        {
            id: 3,
            title: 'Mercedes Clase C',
            year: 2022,
            price: 52000,
            mileage: 15000,
            location: 'Valencia',
            image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            verified: true,
            featured: true
        },
        {
            id: 4,
            title: 'Volkswagen Golf GTI',
            year: 2021,
            price: 32500,
            mileage: 28000,
            location: 'Sevilla',
            image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            verified: false,
            featured: true
        }
    ];

    return (
        <section className="bg-white dark:bg-gray-900 py-16 relative overflow-hidden">
            {/* Elemento decorativo para la transición */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent dark:from-gray-900 dark:to-transparent z-10"></div>

            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 dark:opacity-5">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-100 dark:bg-primary-800 mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-primary-200 dark:bg-primary-700 mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <ScrollReveal animation="slide-up" threshold={0.1} delay={100}>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Coches Destacados</h2>
                        <Link to="/coches" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium group transition-all duration-300">
                            <span className="inline-flex items-center">
                                Ver todos
                                <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                            </span>
                        </Link>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredCars.map((car, index) => (
                        <ScrollReveal
                            key={car.id}
                            animation="fade"
                            delay={200 + (index * 100)}
                            threshold={0.1}
                            duration={500}
                            className="h-full"
                        >
                            <CarCard car={car} />
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedCars;