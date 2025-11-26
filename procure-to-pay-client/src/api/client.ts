import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://p2p-api.moses.it.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('smartp2p_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});
