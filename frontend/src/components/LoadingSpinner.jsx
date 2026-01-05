import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    const sizeClasses = {
        xs: 'loading-xs',
        sm: 'loading-sm',
        md: 'loading-md',
        lg: 'loading-lg'
    };

    return (
        <div className="flex items-center gap-2">
            <span className={`loading loading-spinner ${sizeClasses[size]}`}></span>
            {text && <span className="text-sm opacity-70">{text}</span>}
        </div>
    );
};

export default LoadingSpinner;