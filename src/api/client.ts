import axios, { AxiosError } from "axios";

let errorHandler: ((message: string) => void) | null = null;

export const setErrorHandler = (handler: (message: string) => void) => {
  errorHandler = handler;
};

const getGenericErrorMessage = (statusCode: number): string => {
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
};

const isTechnicalMessage = (message: string): boolean => {
  const technicalPatterns = [
    /\.go:/
  ];
  
  return technicalPatterns.some(pattern => pattern.test(message));
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
      if (isTechnicalMessage(message)) {
        return getGenericErrorMessage(statusCode);
      }
      return message;
    }
    
    const statusText = error.response.statusText || '';
    const genericMessage = getGenericErrorMessage(statusCode);
    
    return genericMessage || statusText || `Error ${statusCode}`;
  }
  
  if (error.request) {
    return 'Error de conexión. Por favor, verifica tu conexión a internet.';
  }
  
  return error.message || 'Ha ocurrido un error inesperado.';
};

// Construir la baseURL correctamente
const getBaseURL = (): string => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (!apiBaseUrl) {
    if (import.meta.env.DEV) {
      return "/v1";
    }
    console.warn("VITE_API_BASE_URL no está configurada, usando backend por defecto");
    return "https://cpi-hub-api.onrender.com/v1";
  }
  
  const cleanUrl = apiBaseUrl.replace(/\/v1\/?$/, "");
  return `${cleanUrl}/v1`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

if (import.meta.env.DEV) {
  console.log("API Base URL:", api.defaults.baseURL);
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `${token}`;
    }
    
    if (import.meta.env.PROD) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
    // Log detallado del error para debug
    console.error("[API Error]", {
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A',
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      request: error.request ? 'Request made but no response' : 'No request made',
    });
    
    if (errorHandler) {
      const message = extractErrorMessage(error);
      errorHandler(message);
    }
    return Promise.reject(error);
  }
);

export default api;
