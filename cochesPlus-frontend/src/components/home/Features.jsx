import React from 'react';
import FeatureCard from './FeatureCard';
import ScrollReveal from '../../utils/ScrollReveal';

const Features = () => {
    const features = [
        {
            title: 'Búsqueda Inteligente',
            description: 'Encuentra el coche perfecto con nuestros filtros avanzados de búsqueda por marca, modelo, año, precio, kilometraje y más.',
            icon: (
                <svg className="w-12 h-12 text-primary dark:text-primary-light" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
                </svg>
            )
        },
        {
            title: 'Verificación de Documentación',
            description: 'Validamos la documentación de los vehículos y otorgamos insignias de verificación para aumentar la confianza entre usuarios.',
            icon: (
                <svg className="w-12 h-12 text-primary dark:text-primary-light" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            )
        },
        {
            title: 'Chat Integrado',
            description: 'Comunicación directa entre compradores y vendedores para resolver dudas y acordar los detalles de la compraventa.',
            icon: (
                <svg className="w-12 h-12 text-primary dark:text-primary-light" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
            )
        },
        {
            title: 'Sistema de Valoraciones',
            description: 'Los compradores pueden valorar a los vendedores tras la compra, creando un entorno de confianza en la comunidad.',
            icon: (
                <svg className="w-12 h-12 text-primary dark:text-primary-light" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }
    ];

    return (
        <section className="bg-background-light dark:bg-primary-dark py-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="absolute top-0 -left-48 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full filter blur-3xl opacity-70"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 dark:bg-primary/20 rounded-full filter blur-3xl opacity-70 -translate-y-1/2"></div>

                <ScrollReveal animation="fade-in" threshold={0.1} delay={100}>
                    <div className="text-center mb-16 relative">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-dark dark:text-text-light mb-6">
                            Por qué elegirnos
                        </h2>
                        <div className="h-1 w-24 bg-primary mx-auto mb-6 rounded-full"></div>
                        <p className="text-lg text-text-secondary dark:text-text-secondary max-w-3xl mx-auto">
                            Descubre las ventajas de comprar y vender tu coche con nosotros. Facilitamos el contacto directo
                            entre compradores y vendedores para que puedan acordar los términos de la transacción de forma
                            segura y transparente.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <ScrollReveal
                            key={index}
                            animation={index % 2 === 0 ? "slide-up" : "slide-right"}
                            delay={200 + (index * 150)}
                            threshold={0.1}
                            duration={600}
                            className="h-full"
                        >
                            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 h-full border border-gray-100 dark:border-gray-700/30 group hover:border-primary/20 dark:hover:border-primary/30">
                                <div className="mb-5 p-3 inline-flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-all duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-text-dark dark:text-text-light mb-3 group-hover:text-primary dark:group-hover:text-primary-light transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-text-secondary dark:text-text-secondary">
                                    {feature.description}
                                </p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;