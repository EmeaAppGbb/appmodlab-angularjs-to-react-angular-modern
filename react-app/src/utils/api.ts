// =============================================================================
// GlobalTravel Corp — API Client
// Replaces Restangular with a lightweight typed fetch wrapper
// =============================================================================

import type { ApiError } from '../types';

export const API_BASE_URL = 'http://localhost:3000/api';

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as ApiError;
      if (body.message) errorMessage = body.message;
    } catch {
      // response body wasn't JSON — keep the default message
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },
};

export { apiClient };
export default apiClient;
