import axios from 'axios';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ROLE_KEY = 'role';

type RetriableRequestConfig = {
  _retry?: boolean;
  url?: string;
  headers?: Record<string, string>;
  [key: string]: unknown;
};

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getRole: () => localStorage.getItem(ROLE_KEY),
  setTokens: (access: string, refresh?: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  setRole: (role: string) => localStorage.setItem(ROLE_KEY, role),
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};

const api = axios.create({
  baseURL: '/api/',
});

let refreshPromise: Promise<string | null> | null = null;

const isAuthEndpoint = (url = '') => {
  return url.includes('users/login/') || url.includes('users/token/refresh/') || url.includes('users/register/');
};

const refreshAccessToken = async () => {
  const refresh = authStorage.getRefreshToken();
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = axios
      .post('/api/users/token/refresh/', { refresh })
      .then((response) => {
        const access = response.data?.access as string | undefined;
        const rotatedRefresh = response.data?.refresh as string | undefined;
        if (!access) return null;
        authStorage.setTokens(access, rotatedRefresh);
        return access;
      })
      .catch(() => {
        authStorage.clear();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      const access = await refreshAccessToken();
      if (access) {
        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${access}`,
        };
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
