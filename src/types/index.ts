// Re-export everything from each type file for easier imports
export * from "./dashboard";
export * from "./user";
export * from "./football";
export * from "./ui";

// Common types used across multiple components
export interface ResponseSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ResponseError {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
}

export type ApiResponse<T = unknown> = ResponseSuccess<T> | ResponseError;

// Auth related types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Utility types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

// Import needed types for re-export
import { User } from "./user";
