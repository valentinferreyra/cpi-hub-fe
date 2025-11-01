import React from 'react';
import { useErrorNotification } from '../../context/ErrorNotificationContext';
import './ErrorNotification.css';

const ErrorNotification: React.FC = () => {
  const { showErrorMessage, errorMessage, hideError } = useErrorNotification();

  if (!showErrorMessage) return null;

  return (
    <div className="error-notification">
      <span className="error-message">{errorMessage}</span>
      <button className="error-close-btn" onClick={hideError}>×</button>
    </div>
  );
};

export default ErrorNotification;

