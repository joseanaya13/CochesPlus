import React from 'react';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/home/HeroSection';
import QuickSearch from '../components/home/QuickSearch';
import Features from '../components/home/Features';
// import FeaturedCars from '../components/home/FeaturedCars';
// import Categories from '../components/home/Categories';
// import Testimonials from '../components/home/Testimonials';
import CallToAction from '../components/home/CallToAction';
import ScrollReveal from '../utils/ScrollReveal';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Layout>
            {/* Hero Section - Primera impresión con call-to-action */}
            <HeroSection />

            {/* Quick Search - Búsqueda rápida de coches con animación de entrada desde abajo */}
            <ScrollReveal animation="slide-up" threshold={0.2}>
                <QuickSearch />
            </ScrollReveal>

            {/* Features - Características principales con animación de fade */}
            <ScrollReveal animation="fade" delay={100} threshold={0.1}>
                <Features />
            </ScrollReveal>

            {/* Featured Cars - Coches destacados con efecto de zoom */}
            <ScrollReveal animation="zoom" delay={200} threshold={0.15}>
                {/* <FeaturedCars /> */}
            </ScrollReveal>

            {/* Categories - Explorar por categorías con efecto de zoom */}
            <ScrollReveal animation="slide-right" delay={200} threshold={0.1}>
                {/* <Categories /> */}
            </ScrollReveal>

            {/* Testimonials - Opiniones de usuarios con efecto de rebote */}
            <ScrollReveal animation="bounce" delay={100} threshold={0.15}>
                {/* <Testimonials /> */}
            </ScrollReveal>

            {/* Call to Action - Invitación final con efecto de fade - Solo para usuarios no autenticados */}
            {!isAuthenticated && (
                <ScrollReveal animation="fade" delay={150} threshold={0.1}>
                    <CallToAction
                        title="¿Listo para encontrar tu próximo coche?"
                        description="Únete a nuestra comunidad y encuentra el vehículo perfecto para ti o vende el tuyo al mejor precio."
                        primaryButtonText="Registrarse"
                        primaryButtonLink="/register"
                        secondaryButtonText="Explorar coches"
                        secondaryButtonLink="/coches"
                    />
                </ScrollReveal>
            )}
        </Layout>
    );
};

export default Home;
