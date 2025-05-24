import React from 'react';
import TestimonialCard from './TestimonialCard';
import ScrollReveal from '../utils/ScrollReveal';

const Testimonials = () => {
    const testimonials = [
        {
            name: 'María García',
            role: 'Compró un Audi A3',
            image: 'https://randomuser.me/api/portraits/women/1.jpg',
            text: 'Encontré mi coche ideal en menos de una semana. El proceso fue mucho más sencillo de lo que esperaba y el vendedor fue muy profesional.',
            rating: 5
        },
        {
            name: 'Carlos Rodríguez',
            role: 'Vendió un BMW Serie 3',
            image: 'https://randomuser.me/api/portraits/men/2.jpg',
            text: 'Gracias a CochesPlus pude vender mi coche en tiempo récord y a un precio justo. La plataforma es muy intuitiva y el soporte técnico excelente.',
            rating: 5
        },
        {
            name: 'Laura Martínez',
            role: 'Compró un Seat León',
            image: 'https://randomuser.me/api/portraits/women/3.jpg',
            text: 'La verificación de los vehículos me dio mucha tranquilidad. Todo el proceso fue transparente y el coche estaba en perfecto estado, tal como lo describieron.',
            rating: 4
        }
    ];

    return (
        <section className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 py-16 relative">
            {/* Elemento decorativo para la transición */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-50/80 to-transparent dark:from-gray-800/80 dark:to-transparent z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal animation="slide-up" threshold={0.1} delay={100}>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Lo que dicen nuestros usuarios</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty">
                            Conoce las experiencias de compradores y vendedores que han utilizado CochesPlus para sus transacciones.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <ScrollReveal
                            key={index}
                            animation="slide-up"
                            delay={150 + (index * 100)}
                            threshold={0.1}
                            duration={600}
                        >
                            <TestimonialCard testimonial={testimonial} />
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;