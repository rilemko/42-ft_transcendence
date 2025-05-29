import React, { createContext, useEffect, useState, useCallback, useContext } from 'react';

import Toast from '../components/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [timers, setTimers] = useState({});

    const addToast = useCallback((message, className = '', duration = 3000) => {
        const id = Math.random().toString(36);
        setToasts((toasts) => [...toasts, { id, message, className, duration }]);

        const timerId = setTimeout(() => {
            removeToast(id);
        }, duration);

        setTimers((prevTimers) => ({ ...prevTimers, [id]: timerId }));
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((toasts) => toasts.filter((toast) => toast.id !== id));

        setTimers((prevTimers) => {
            clearTimeout(prevTimers[id]);
            const { [id]: _, ...rest } = prevTimers;
            return rest;
        });
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            {toasts.length > 0 &&
                <div className="toasts">
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            onClose={() => removeToast(toast.id)}
                            message={toast.message}
                            className={toast.className}
                            duration={toast.duration}
                        />
                    ))}
                </div>
            }
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
