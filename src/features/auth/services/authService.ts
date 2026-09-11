import axios from "axios";
import { apiClient } from "@/infrastructure/api/client";
import { authStorage } from "@/features/auth/services/authStorage";
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from "@/features/auth/types/auth.types";

/**
 * Decodes the payload of a JWT without verifying its signature.
 * Used only as a fallback to populate a display name / role when
 * GET /users/me/ is unreachable for some reason.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function userFromToken(accessToken: string): AuthUser {
  const claims = decodeJwtPayload(accessToken) ?? {};
  return {
    id: String(claims.user_id ?? claims.sub ?? ""),
    name: String(claims.name ?? claims.email ?? "User"),
    email: String(claims.email ?? ""),
    role: String(claims.role ?? "SALES_USER"),
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { data } = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"}/auth/login/`,
      credentials,
      { headers: { "ngrok-skip-browser-warning": "true" } }
    );

    authStorage.setTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
    });

    const user = data.user ?? (await this.fetchCurrentUser()) ?? userFromToken(data.access_token);
    authStorage.setUser(user);
    return user;
  },

  /**
   * GET /users/me/ — confirmed in Postman to return
   * { id, name, email, role }. Falls back to decoding the JWT if the
   * endpoint is briefly unreachable, so login still succeeds.
   */
  async fetchCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data } = await apiClient.get<AuthUser>("/users/me/");
      return data;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    const refreshToken = authStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post("/auth/logout/", { refresh_token: refreshToken });
      }
    } catch {
      // Best effort — clear the local session regardless.
    } finally {
      authStorage.clear();
    }
  },

  getSessionUser(): AuthUser | null {
    return authStorage.getUser();
  },

  isAuthenticated(): boolean {
    return Boolean(authStorage.getAccessToken());
  },
};
