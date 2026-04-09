const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Cookie helper for client-side
function getSessionToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )swoopt-session=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

import type { PaginationMeta } from '@/types/api';

// Build headers with auth token
function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getSessionToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return { ...headers, ...extra };
}

// Generic fetch wrapper
async function request<T>(path: string, options?: RequestInit): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: buildHeaders(options?.headers as Record<string, string>),
    });

    const json = await res.json();

    if (!res.ok || json.success === false) {
      return {
        data: null,
        error: json.error?.message || json.error?.code || `Request failed with status ${res.status}`,
        status: res.status,
      };
    }

    return { data: json.data as T, error: null, status: res.status };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      status: 0,
    };
  }
}

// Paginated fetch — returns meta alongside data for cursor-based pagination
async function requestPaginated<T>(path: string, options?: RequestInit): Promise<{ data: T | null; meta: PaginationMeta | null; error: string | null; status: number }> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: buildHeaders(options?.headers as Record<string, string>),
    });

    const json = await res.json();

    if (!res.ok || json.success === false) {
      return {
        data: null,
        meta: null,
        error: json.error?.message || json.error?.code || `Request failed with status ${res.status}`,
        status: res.status,
      };
    }

    return { data: json.data as T, meta: json.meta ?? null, error: null, status: res.status };
  } catch (err) {
    return {
      data: null,
      meta: null,
      error: err instanceof Error ? err.message : 'Network error',
      status: 0,
    };
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  getPaginated: <T>(path: string) => requestPaginated<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
