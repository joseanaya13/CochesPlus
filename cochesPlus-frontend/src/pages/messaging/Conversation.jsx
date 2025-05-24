import { useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

const Conversation = () => {
    const { id } = useParams();

    return (
        <Layout>
            <div className="bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold">Conversación</h1>
                    <p className="mt-2">Chat con vendedor/comprador (ID: {id})</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                    Aquí irá el chat y el historial de mensajes
                </p>
            </div>
        </Layout>
    );
};

export default Conversation;
