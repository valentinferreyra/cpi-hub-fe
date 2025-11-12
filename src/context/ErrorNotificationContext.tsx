import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ErrorNotificationContextType {
  showError: (message: string, duration?: number) => void;
  hideError: () => void;
  errorMessage: string;
  showErrorMessage: boolean;
}

const ErrorNotificationContext = createContext<ErrorNotificationContextType | undefined>(undefined);

export const ErrorNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const showError = useCallback((message: string, duration: number = 5000) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    
    setTimeout(() => {
      setShowErrorMessage(false);
    }, duration);
  }, []);

  const hideError = useCallback(() => {
    setShowErrorMessage(false);
  }, []);

  return (
    <ErrorNotificationContext.Provider
      value={{
        showError,
        hideError,
        errorMessage,
        showErrorMessage,
      }}
    >
      {children}
    </ErrorNotificationContext.Provider>
  );
};

export const useErrorNotification = (): ErrorNotificationContextType => {
  const context = useContext(ErrorNotificationContext);
  if (!context) {
    throw new Error('useErrorNotification must be used within ErrorNotificationProvider');
  }
  return context;
};

