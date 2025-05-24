import React from 'react';

const Spinner = ({ variant }) => (
    <div className="flex items-center justify-center">
        {variant === "page" ? (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        ) : (
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-t-primary border-secondary black:border-t-primary black:border-primary-dark" />
        )}
    </div>
);

export default Spinner;