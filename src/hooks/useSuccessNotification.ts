import { useState, useCallback } from 'react';

interface UseSuccessNotificationReturn {
  showSuccessMessage: boolean;
  successMessageText: string;
  showSuccess: (message: string, duration?: number) => void;
  hideSuccess: () => void;
}

export const useSuccessNotification = (
  defaultDuration: number = 3000
): UseSuccessNotificationReturn => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState<string>('');

  const showSuccess = useCallback((message: string, duration: number = defaultDuration) => {
    setSuccessMessageText(message);
    setShowSuccessMessage(true);
    
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, duration);
  }, [defaultDuration]);

  const hideSuccess = useCallback(() => {
    setShowSuccessMessage(false);
  }, []);

  return {
    showSuccessMessage,
    successMessageText,
    showSuccess,
    hideSuccess
  };
};
