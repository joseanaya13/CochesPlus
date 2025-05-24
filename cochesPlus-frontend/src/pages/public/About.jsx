import React from 'react';
import Layout from '../../components/layout/Layout';
import CallToAction from '../../components/home/CallToAction';

const About = () => {
    return (
        <Layout>
            <div className="bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold">Sobre Nosotros</h1>
                    <p className="mt-2">Conoce quiénes somos y nuestra misión en CochesPlus</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                    Aquí irá el contenido sobre la empresa, valores y equipo
                </p>
            </div>

            <CallToAction
                title="¿Listo para unirte a CochesPlus?"
                description="Forma parte de nuestra comunidad y descubre una nueva forma de comprar y vender coches."
                primaryButtonText="Registrarse"
                primaryButtonLink="/register"
                secondaryButtonText="Explorar coches"
                secondaryButtonLink="/coches"
            />
        </Layout>
    );
};

export default About;
