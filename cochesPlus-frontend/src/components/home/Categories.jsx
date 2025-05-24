import React from 'react';
import CategoryCard from './CategoryCard';
import ScrollReveal from '../utils/ScrollReveal';

const Categories = () => {
    const categories = [
        {
            name: 'SUV',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ),
            count: 156
        },
        {
            name: 'Sedán',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            count: 243
        },
        {
            name: 'Deportivo',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
            ),
            count: 58
        },
        {
            name: 'Eléctrico',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            count: 85
        },
        {
            name: 'Familiar',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            count: 124
        },
        {
            name: 'Compacto',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                </svg>
            ),
            count: 192
        }
    ];

    return (
        <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 py-16 relative">
            {/* Elemento decorativo para la transición */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/70 to-transparent dark:from-gray-900/70 dark:to-transparent z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal animation="slide-up" threshold={0.1} delay={100}>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Explora por categoría</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty">
                            Encuentra el vehículo que se adapte a tus necesidades en nuestras diversas categorías.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((category, index) => (
                        <ScrollReveal
                            key={index}
                            animation="zoom"
                            delay={150 + (index * 75)}
                            threshold={0.1}
                            duration={400}
                            once={true}
                        >
                            <CategoryCard category={category} />
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories;