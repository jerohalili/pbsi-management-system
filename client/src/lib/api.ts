import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
// Normalize so baseURL always ends with /api (handles both with and without trailing /api)
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '') + '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint = originalRequest.url?.includes('/auth/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
          const token = data.access_token;
          localStorage.setItem('access_token', token);
          isRefreshing = false;
          onRefreshed(token);
        } catch {
          isRefreshing = false;
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          return Promise.reject(error);
        }
      }

      return new Promise((resolve) => {
        addSubscriber((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  },
);

export default api;
