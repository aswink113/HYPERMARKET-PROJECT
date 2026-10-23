export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
export const API_BASE_URL = `${BACKEND_URL}/api`;

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
