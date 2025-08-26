import axios from 'axios';
import type { SearchSpacesResponse } from '../types/space';

const api = axios.create({
  baseURL: 'http://localhost:8080/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    console.log('Enviando request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Response recibido:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Error en request:', error.message);
    return Promise.reject(error);
  }
);


// spaces
export const getSpaces = async (): Promise<SearchSpacesResponse> => {
  try {
    const response = await api.get('/spaces');
    return response.data;
  } catch (error) {
    console.error('Error getting spaces:', error);
    throw error;
  }
};

export default api;
