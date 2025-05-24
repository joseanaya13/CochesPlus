import React from 'react';
import Layout from '../../components/layout/Layout';

const Messages = () => {
    return (
        <Layout>
            <div className="bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold">Mensajes</h1>
                    <p className="mt-2">Comunicaciones con compradores interesados</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                    Aquí irá la bandeja de mensajes y el sistema de chat
                </p>
            </div>
        </Layout>
    );
};

export default Messages;
