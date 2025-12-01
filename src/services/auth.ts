/**
 * Authentication Service with AWS Cognito Integration
 *
 * Handles:
 * - User registration and email verification
 * - Login with rate limiting support
 * - Token refresh
 * - Password reset
 */

import api from './api';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone_number?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface AuthUser {
  id: string;
  cognito_sub: string;
  email: string;
  name: string;
  stats: {
    events_created: number;
    events_attended: number;
    collectibles_count: number;
    total_video_minutes: number;
  };
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

export interface RateLimitError {
  error: string;
  blocked_for_seconds: number;
  message: string;
}

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'citypulse_access_token',
  ID_TOKEN: 'citypulse_id_token',
  REFRESH_TOKEN: 'citypulse_refresh_token',
  TOKEN_EXPIRY: 'citypulse_token_expiry',
};

/**
 * Store tokens in localStorage
 */
export const storeTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.access_token);
  localStorage.setItem(TOKEN_KEYS.ID_TOKEN, tokens.id_token);
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refresh_token);

  // Store expiry time
  const expiryTime = Date.now() + tokens.expires_in * 1000;
  localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
  if (!expiry) return true;

  // Add 5 minute buffer before actual expiry
  return Date.now() > parseInt(expiry) - 5 * 60 * 1000;
};

/**
 * Clear all stored tokens
 */
export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.ID_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
};

/**
 * Register a new user with Cognito
 */
export const register = async (data: RegisterRequest): Promise<{
  message: string;
  user_sub: string;
  email: string;
  confirmed: boolean;
}> => {
  const response = await api.post('/api/auth/register', data);
  return response.data;
};

/**
 * Confirm email with verification code
 */
export const confirmEmail = async (
  email: string,
  confirmationCode: string
): Promise<{ message: string; email: string }> => {
  const response = await api.post('/api/auth/confirm', {
    email,
    confirmation_code: confirmationCode,
  });
  return response.data;
};

/**
 * Resend email verification code
 */
export const resendConfirmationCode = async (
  email: string
): Promise<{ message: string }> => {
  const response = await api.post('/api/auth/resend-code', null, {
    params: { email },
  });
  return response.data;
};

/**
 * Login with email and password
 *
 * Note: This endpoint has rate limiting (5 attempts/min, 15 min block)
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post('/api/auth/login', data);
    const authData: AuthResponse = response.data;

    // Store tokens
    storeTokens({
      access_token: authData.access_token,
      id_token: authData.id_token,
      refresh_token: authData.refresh_token,
      expires_in: authData.expires_in,
      token_type: authData.token_type,
    });

    return authData;
  } catch (error: any) {
    // Check for rate limit error
    if (error.response?.status === 429) {
      const rateLimitData: RateLimitError = error.response.data;
      throw new Error(
        `Too many login attempts. Please wait ${Math.ceil(
          rateLimitData.blocked_for_seconds / 60
        )} minutes.`
      );
    }
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (): Promise<{
  access_token: string;
  id_token: string;
  expires_in: number;
}> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await api.post('/api/auth/refresh', {
    refresh_token: refreshToken,
  });

  const data = response.data;

  // Update stored tokens
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.access_token);
  localStorage.setItem(TOKEN_KEYS.ID_TOKEN, data.id_token);

  const expiryTime = Date.now() + data.expires_in * 1000;
  localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());

  return data;
};

/**
 * Request password reset
 */
export const forgotPassword = async (
  email: string
): Promise<{ message: string }> => {
  const response = await api.post('/api/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password with confirmation code
 */
export const resetPassword = async (
  email: string,
  confirmationCode: string,
  newPassword: string
): Promise<{ message: string }> => {
  const response = await api.post('/api/auth/reset-password', {
    email,
    confirmation_code: confirmationCode,
    new_password: newPassword,
  });
  return response.data;
};

/**
 * Logout - clear tokens and auth state
 */
export const logout = (): void => {
  clearTokens();
};

/**
 * Check rate limit status for current IP
 */
export const getRateLimitStatus = async (): Promise<{
  ip: string;
  status: string;
  failed_attempts: number;
  blocked_until: string | null;
  remaining_seconds: number;
}> => {
  const response = await api.get('/api/auth/rate-limit-status');
  return response.data;
};

export default {
  register,
  confirmEmail,
  resendConfirmationCode,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  logout,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  storeTokens,
  clearTokens,
  getRateLimitStatus,
};
