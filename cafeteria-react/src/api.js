import axios from 'axios';

// Asegura HTTPS y elimina la barra final para evitar redirecciones 301/302
const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || 'https://cafeteria-backend-mf04.onrender.com';
  url = url.trim().replace(/\/$/, '');
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  return url;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});