import axios from 'axios';
import {
  clearAuth,
  getRefreshToken,
  saveAuth,
  updateAccessToken,
} from './auth';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    updateAccessToken(response.data.accessToken);
    saveAuth(
      response.data.accessToken,
      response.data.user,
      response.data.refreshToken,
    );

    return response.data.accessToken as string;
  } catch {
    clearAuth();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as any;

    if (
      typeof window !== 'undefined' &&
      error?.response?.status === 401 &&
      !original?._retried &&
      !String(original?.url || '').includes('/auth/refresh')
    ) {
      original._retried = true;

      if (!refreshing) {
        refreshing = refreshAccessToken().finally(() => {
          refreshing = null;
        });
      }

      const token = await refreshing;

      if (token) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return api.request(original);
      }
    }

    return Promise.reject(error);
  },
);
