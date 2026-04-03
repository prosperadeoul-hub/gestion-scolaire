import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import './Toast.css';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? (
              <CheckCircleIcon className="toast-icon" />
            ) : (
              <XCircleIcon className="toast-icon" />
            )}
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
