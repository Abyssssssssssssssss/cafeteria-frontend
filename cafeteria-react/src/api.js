import axios from 'axios';

// Aseguramos la URL en HTTPS y fallback correcto sin barras al final
const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
  : 'https://cafeteria-backend-mf04.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});