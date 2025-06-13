import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Alert = ({ message, type = 'info', onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getAlertClasses = () => {
        switch (type) {
            case 'success':
                return 'bg-success text-white';
            case 'error':
                return 'bg-error text-white';
            case 'warning':
                return 'bg-warning text-white';
            default:
                return 'bg-info text-white';
        }
    };

    if (!visible) return null;

    return (
        <div className={`p-4 mb-4 rounded-md ${getAlertClasses()}`}>
            <div className="flex items-center justify-between">
                <span>{message}</span>
                <button className="ml-4 text-white" onClick={() => { setVisible(false); onClose(); }}>
                    X
                </button>
            </div>
        </div>
    );
};

Alert.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    onClose: PropTypes.func.isRequired
};

export default Alert;
