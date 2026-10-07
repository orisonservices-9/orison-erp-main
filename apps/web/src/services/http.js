import axios from 'axios';
import { demoAnswer, demoCanAnswer, isThinResponse } from '../demo/gateway';

const configured = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const backendUrl = import.meta.env.DEV && (!configured || configured.includes(':8001'))
  ? 'http://localhost:8002'
  : configured;

export const API_BASE = backendUrl ? `${backendUrl}/api` : '/api';

export const http = axios.create({ baseURL: API_BASE });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('orison_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (!config.headers['X-Request-Id']) {
    config.headers['X-Request-Id'] = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `req-${Date.now()}`;
  }
  return config;
});

const demoResponse = (config, data) => ({ data, status: 200, statusText: 'OK', headers: {}, config });

http.interceptors.response.use(
  (response) => {
    const config = response.config || {};
    if (config.responseType === 'blob' || !demoCanAnswer(config.url)) return response;
    if (isThinResponse(config.url, response.data)) response.data = demoAnswer(config);
    return response;
  },
  (error) => {
    const config = error.config || {};
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('orison_token');
      localStorage.removeItem('orison_auth');
      if (window.location.pathname !== '/') window.location.href = '/';
      return Promise.reject(error);
    }
    if (config.responseType !== 'blob' && demoCanAnswer(config.url)) return Promise.resolve(demoResponse(config, demoAnswer(config)));
    return Promise.reject(error);
  }
);
