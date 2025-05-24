import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-b from-gray-900 to-primary-dark text-white relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-20 w-80 h-80 bg-primary/20 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Logo y descripción */}
                    <div className="space-y-6">
                        <div className="flex items-center mb-4 animate-fade">
                            <span className="text-primary text-3xl font-bold">Coches</span>
                            <span className="text-white text-3xl font-bold">Plus</span>
                        </div>
                        <p className=" mb-6 max-w-sm text-pretty animate-slide-up">
                            Tu marketplace de confianza para comprar y vender coches de manera segura y transparente.
                        </p>
                        <div className="flex space-x-5">
                            <a href="#" className=" hover:text-primary transition-colors duration-300 hover-lift" aria-label="Facebook">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className=" hover:text-primary transition-colors duration-300 hover-lift" aria-label="Instagram">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className=" hover:text-primary transition-colors duration-300 hover-lift" aria-label="Twitter">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a href="#" className=" hover:text-primary transition-colors duration-300 hover-lift" aria-label="YouTube">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    
                    {/* Enlaces de navegación divididos en columnas */}
                    <div className="mt-6 md:mt-0">
                        <h3 className="text-lg font-semibold mb-5 !text-primary relative pb-2 inline-block">
                            Explora
                            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary"></span>
                        </h3>
                        <ul className="space-y-3">
                            <li><Link to="/coches" className="hover:text-primary transition-colors duration-200 group flex items-center">
                                <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-2 mr-0 group-hover:mr-2"></span>
                                Buscar coches</Link>
                            </li>
                            <li><Link to="/vendedor/publicar" className=" hover:text-primary transition-colors duration-200 group flex items-center">
                                <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-2 mr-0 group-hover:mr-2"></span>
                                Vender coche</Link>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="mt-6 lg:mt-0">
                        <h3 className="text-lg font-semibold mb-5 !text-primary relative pb-2 inline-block">
                            Compañía
                            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary"></span>
                        </h3>
                        <ul className="space-y-3">
                            <li><Link to="/about" className=" hover:text-primary transition-colors duration-200 group flex items-center">
                                <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-2 mr-0 group-hover:mr-2"></span>
                                Sobre nosotros</Link>
                            </li>
                            <li><Link to="/contacto" className=" hover:text-primary transition-colors duration-200 group flex items-center">
                                <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-2 mr-0 group-hover:mr-2"></span>
                                Contacto</Link>
                            </li>
                            <li><Link to="/faq" className=" hover:text-primary transition-colors duration-200 group flex items-center">
                                <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-2 mr-0 group-hover:mr-2"></span>
                                Preguntas frecuentes</Link>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="mt-6 lg:mt-0">
                        <h3 className="text-lg font-semibold mb-5 !text-primary relative pb-2 inline-block">
                            Legal
                            <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary"></span>
                        </h3>
                        <ul className="space-y-3">
                            <li><Link to="/privacidad" className=" hover:text-primary transition-colors duration-200 group flex items-center">
                                <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-2 mr-0 group-hover:mr-2"></span>
                                Política de privacidad</Link>
                            </li>
                            <li><Link to="/terminos" className=" hover:text-primary transition-colors duration-200 group flex items-center">
                                <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-2 mr-0 group-hover:mr-2"></span>
                                Términos de servicio</Link>
                            </li>
                            <li><Link to="/cookies" className=" hover:text-primary transition-colors duration-200 group flex items-center">
                                <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-2 mr-0 group-hover:mr-2"></span>
                                Política de cookies</Link>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Copyright con efecto de línea superior */}
                <div className="mt-12 pt-6 border-t border-gray-800/60 text-center">
                    <p className=" text-sm">© {new Date().getFullYear()} CochesPlus. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
