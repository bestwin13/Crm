import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authStorage } from "@/features/auth/services/authStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    // Skips ngrok's free-tier HTML warning page, which otherwise intercepts
    // the request and returns an interstitial with no CORS headers at all.
    "ngrok-skip-browser-warning": "true",
  },
});

// Attach the access token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// A plain axios instance (no interceptors) so the refresh call itself
// never gets caught in the 401 -> refresh -> 401 loop.
const rawClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Body key confirmed against the team's Postman collection: refresh_token.
    const { data } = await rawClient.post<{
      access_token: string;
      refresh_token?: string;
    }>("/auth/refresh/", { refresh_token: refreshToken });

    authStorage.setAccessToken(data.access_token);
    // SimpleJWT rotates refresh tokens on every use in this backend.
    if (data.refresh_token) {
      authStorage.setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: "Bearer",
      });
    }
    return data.access_token;
  } catch {
    return null;
  }
}

// On a 401, try exactly one silent refresh, replay the original request,
// and otherwise sign the user out.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retried) {
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    refreshPromise = refreshPromise ?? refreshAccessToken();
    const newAccessToken = await refreshPromise;
    refreshPromise = null;

    if (!newAccessToken) {
      authStorage.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return apiClient(originalRequest);
  }
);
