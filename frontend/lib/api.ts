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

  // Render free backend may need some time to wake up.
  timeout: 15000,

  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});


// -------------------------------------------------------
// RENDER COLD-START RETRY
// -------------------------------------------------------

const retryDelays = [
  1500,
  2500,
  4000,
  6000,
  8000,
  10000,
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function canRetryRequest(error: any, config: any) {
  if (!config) return false;

  const method =
    String(config.method || 'get').toLowerCase();

  // Automatically retry only safe/read requests.
  // We do NOT automatically repeat checkout/order POST requests.
  const safeMethod = [
    'get',
    'head',
    'options',
  ].includes(method);

  if (!safeMethod) return false;

  const status = error?.response?.status;

  // Browser network failure / sleeping backend / timeout
  if (!error?.response) {
    return true;
  }

  return [
    408,
    425,
    429,
    500,
    502,
    503,
    504,
  ].includes(status);
}


// -------------------------------------------------------
// AUTH REFRESH
// -------------------------------------------------------

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {
        refreshToken,
      },
      {
        timeout: 15000,
      },
    );

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


// -------------------------------------------------------
// RESPONSE HANDLING
// -------------------------------------------------------

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config as any;

    // -----------------------------------------------
    // 1. Retry temporary backend/network failures
    // -----------------------------------------------

    if (canRetryRequest(error, original)) {
      original.__coldStartRetry =
        Number(original.__coldStartRetry || 0);

      if (
        original.__coldStartRetry <
        retryDelays.length
      ) {
        const delay =
          retryDelays[original.__coldStartRetry];

        original.__coldStartRetry += 1;

        if (
          process.env.NODE_ENV !== 'production'
        ) {
          console.info(
            `[API] Backend unavailable. Retry ${original.__coldStartRetry}/${retryDelays.length} in ${delay}ms`,
          );
        }

        await sleep(delay);

        return api.request(original);
      }
    }


    // -----------------------------------------------
    // 2. Refresh expired authentication token
    // -----------------------------------------------

    if (
      typeof window !== 'undefined' &&
      error?.response?.status === 401 &&
      !original?._retried &&
      !String(original?.url || '').includes(
        '/auth/refresh',
      )
    ) {
      original._retried = true;

      if (!refreshing) {
        refreshing =
          refreshAccessToken().finally(() => {
            refreshing = null;
          });
      }

      const token = await refreshing;

      if (token) {
        original.headers =
          original.headers || {};

        original.headers.Authorization =
          `Bearer ${token}`;

        return api.request(original);
      }
    }

    return Promise.reject(error);
  },
);
