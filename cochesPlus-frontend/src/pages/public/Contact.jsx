import React from 'react';
import Layout from '../../components/layout/Layout';

const Contact = () => {
    return (
        <Layout>
            <div className="bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold">Contacto</h1>
                    <p className="mt-2">Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                    Aquí irá el formulario de contacto y la información de la empresa
                </p>
            </div>
        </Layout>
    );
};

export default Contact;
