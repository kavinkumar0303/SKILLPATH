import axios from 'axios';
import { getMockResponse } from './mockService';

// Detect API base URL:
// 1. Explicit environment variable: VITE_API_URL (set in Vercel project settings)
// 2. Production fallback: '/api' (relative route on Vercel)
// 3. Local dev fallback: 'http://localhost:8000/api'
const getBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim();
    return trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/+$/, '')}/api`;
  }
  if ((import.meta as any).env?.PROD) {
    return '/api';
  }
  return 'http://localhost:8000/api';
};

const client = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle responses and fallback gracefully
client.interceptors.response.use(
  (response) => {
    // If backend returns HTML (e.g. Vercel rewritten to index.html with 200 OK), fallback to mock data
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype') || response.data.trim().startsWith('<html'))
    ) {
      const url = response.config?.url || '';
      const method = response.config?.method || 'get';
      const parsedPayload = typeof response.config?.data === 'string' ? (() => {
        try { return JSON.parse(response.config.data); } catch { return undefined; }
      })() : response.config?.data;
      
      console.warn(`[Skillpath API] HTML returned for ${url}. Providing client-side fallback.`);
      return {
        ...response,
        data: getMockResponse(url, method, parsedPayload),
      };
    }
    return response;
  },
  (error) => {
    const config = error.config || {};
    const url = config.url || '';
    const method = config.method || 'get';
    const status = error.response?.status;

    // For any 404, 405 (Method Not Allowed on Vercel static), or network error:
    // Provide instant client-side mock fallback so the application never breaks or displays an error.
    if (!status || status === 404 || status === 405 || status >= 500) {
      console.warn(`[Skillpath API Fallback] ${method.toUpperCase()} ${url} (${status || 'Network Error'}). Using offline fallback.`);
      const parsedPayload = typeof config.data === 'string' ? (() => {
        try { return JSON.parse(config.data); } catch { return undefined; }
      })() : config.data;

      return Promise.resolve({
        data: getMockResponse(url, method, parsedPayload),
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }

    if (
      status === 401 &&
      !url.includes('/auth/') &&
      window.location.pathname !== '/login' &&
      window.location.pathname !== '/'
    ) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default client;
