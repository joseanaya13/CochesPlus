import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, confirmAction, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
            setTimeout(() => setMounted(false), 300);
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    if (!isOpen && !mounted) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div
                className="fixed inset-0 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Contenido del modal */}
            <div className={`relative z-50 bg-primary-light dark:bg-primary-dark border border-secondary-light dark:border-secondary-dark rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transition-all duration-300 ${isOpen ? 'animate-bounce-in' : 'scale-95 opacity-0'}`}>
                {/* Encabezado con título y botón de cierre */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-secondary-light dark:border-secondary-dark">
                    <h3 className="text-xl font-bold text-text-dark dark:text-text-light">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-secondary hover:text-error transition-colors"
                        aria-label="Cerrar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Contenido del modal */}
                <div className="mt-4 text-text-dark dark:text-text-secondary">
                    {children}
                </div>

                {/* Botones de acción */}
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="primary" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button variant="primary" onClick={confirmAction}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    confirmAction: PropTypes.func.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string
};

export default Modal;
