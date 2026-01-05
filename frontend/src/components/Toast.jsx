import React from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// Custom toast configurations
export const toastConfig = {
    duration: 4000,
    position: 'top-right',
    style: {
        background: 'var(--fallback-b1,oklch(var(--b1)))',
        color: 'var(--fallback-bc,oklch(var(--bc)))',
        border: '1px solid var(--fallback-b3,oklch(var(--b3)))',
        borderRadius: '0.5rem',
        padding: '16px',
        fontSize: '14px',
        maxWidth: '400px',
    },
    success: {
        iconTheme: {
            primary: 'var(--fallback-su,oklch(var(--su)))',
            secondary: 'var(--fallback-suc,oklch(var(--suc)))',
        },
    },
    error: {
        iconTheme: {
            primary: 'var(--fallback-er,oklch(var(--er)))',
            secondary: 'var(--fallback-erc,oklch(var(--erc)))',
        },
    },
};

// Enhanced toast functions
export const showToast = {
    success: (message, options = {}) => {
        toast.success(message, {
            ...toastConfig,
            ...options,
            icon: <CheckCircle className="w-5 h-5 text-success" />,
        });
    },

    error: (message, options = {}) => {
        toast.error(message, {
            ...toastConfig,
            ...options,
            icon: <XCircle className="w-5 h-5 text-error" />,
        });
    },

    warning: (message, options = {}) => {
        toast(message, {
            ...toastConfig,
            ...options,
            icon: <AlertCircle className="w-5 h-5 text-warning" />,
        });
    },

    info: (message, options = {}) => {
        toast(message, {
            ...toastConfig,
            ...options,
            icon: <Info className="w-5 h-5 text-info" />,
        });
    },

    loading: (message, options = {}) => {
        return toast.loading(message, {
            ...toastConfig,
            ...options,
        });
    },

    promise: (promise, messages, options = {}) => {
        return toast.promise(promise, messages, {
            ...toastConfig,
            ...options,
        });
    },
};

export default showToast;