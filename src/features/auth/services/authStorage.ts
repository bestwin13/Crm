import type { AuthTokens, AuthUser } from "@/features/auth/types/auth.types";

/**
 * Thin wrapper around localStorage so the rest of the app never touches
 * the browser storage API directly.
 *
 * NOTE: localStorage is used here to keep the demo self-contained and easy
 * to run. For a production deployment, prefer httpOnly, secure cookies set
 * by the backend so tokens are never reachable from client-side JS.
 */
const ACCESS_TOKEN_KEY = "crm.access_token";
const REFRESH_TOKEN_KEY = "crm.refresh_token";
const USER_KEY = "crm.user";

const isBrowser = () => typeof window !== "undefined";

export const authStorage = {
  getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(tokens: AuthTokens): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },

  setAccessToken(accessToken: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },

  getUser(): AuthUser | null {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  setUser(user: AuthUser): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};
