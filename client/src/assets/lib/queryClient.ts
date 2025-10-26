import { QueryClient, QueryFunction } from "@tanstack/react-query";

export const TOKEN_KEY = 'auth_token';
const DOMAIN_URL = 'https://huy-nguyen-ielts.com';
// const DOMAIN_URL = 'http://127.0.0.1:8000';
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}


export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  token?: string | null,
): Promise<any> {
  let header: Record<string, string> = {};

  if (data) {
    header['Content-Type'] = 'application/json';
    header['Accept'] = 'application/json';
  }

  // Thêm token nếu có
  if (!token) {
    token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  }
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  // 🛠 Thêm XSRF token nếu có cookie
  const xsrfToken = getCookie('XSRF-TOKEN');
  if (xsrfToken) {
    header['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }

  const res = await fetch(DOMAIN_URL + url, {
    method,
    credentials: 'include',
    headers: header,
    body: data ? JSON.stringify(data) : undefined,
  });

  const contentType = res.headers.get('content-type');
  let result: any = null;
  if (contentType && contentType.includes('application/json')) {
    try {
      result = await res.json();
    } catch (e) {
      result = null;
    }
  } else {
    result = await res.text();
  }

  if (!res.ok) {
    throw new Error(result?.message || result || 'Server error');
  }

  return result;
}


export const getQueryFn = <T>(): QueryFunction<T | null> =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(DOMAIN_URL + queryKey[0] as string, {
      headers,
    });

    const contentType = res.headers.get('content-type');
    let result: any = null;
    if (contentType && contentType.includes('application/json')) {
      try {
        result = await res.json();
      } catch (e) {
        result = null;
      }
    } else {
      result = await res.text();
    }

    if (!res.ok) {
      throw new Error(result?.message || result || 'Server error');
    }

    return result;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn(),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
