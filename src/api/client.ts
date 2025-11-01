import axios, { AxiosError } from "axios";

let errorHandler: ((message: string) => void) | null = null;

export const setErrorHandler = (handler: (message: string) => void) => {
  errorHandler = handler;
};

const isTechnicalMessage = (message: string): boolean => {
  const technicalPatterns = [
    /\.go:/
  ];
  
  return technicalPatterns.some(pattern => pattern.test(message));
};

const sanitizeMessage = (message: string, statusCode: number): string => {
  if (isTechnicalMessage(message)) {
    if (statusCode === 400) {
      return 'Solicitud inválida. Por favor, verifica los datos ingresados.';
    }
    if (statusCode === 401) {
      return 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
    }
    if (statusCode === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }
    if (statusCode === 404) {
      return 'Recurso no encontrado.';
    }
    if (statusCode === 422) {
      return 'Los datos proporcionados no son válidos. Por favor, verifica la información.';
    }
    if (statusCode === 500) {
      return 'Error interno del servidor. Por favor, intenta más tarde.';
    }
    return 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  }
  
  return message;
};

const extractErrorMessage = (error: AxiosError): string => {
  if (error.response) {
    const data = error.response.data as any;
    const statusCode = error.response.status;
    
    let message = '';
    
    if (data?.message) {
      message = data.message;
    } else if (data?.error) {
      message = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    } else if (data?.detail) {
      message = data.detail;
    } else if (typeof data === 'string') {
      message = data;
    }
    
    if (message) {
      return sanitizeMessage(message, statusCode);
    }
    
    const statusText = error.response.statusText || '';
    
    if (statusCode === 400) {
      return 'Solicitud inválida. Por favor, verifica los datos ingresados.';
    }
    if (statusCode === 401) {
      return 'No autorizado. Por favor, inicia sesión nuevamente.';
    }
    if (statusCode === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }
    if (statusCode === 404) {
      return 'Recurso no encontrado.';
    }
    if (statusCode === 422) {
      return 'Los datos proporcionados no son válidos. Por favor, verifica la información.';
    }
    if (statusCode === 500) {
      return 'Error interno del servidor. Por favor, intenta más tarde.';
    }
    
    return statusText || `Error ${statusCode}`;
  }
  
  if (error.request) {
    return 'Error de conexión. Por favor, verifica tu conexión a internet.';
  }
  
  return error.message || 'Ha ocurrido un error inesperado.';
};

const api = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (errorHandler) {
      const message = extractErrorMessage(error);
      errorHandler(message);
    }
    return Promise.reject(error);
  }
);

export default api;
