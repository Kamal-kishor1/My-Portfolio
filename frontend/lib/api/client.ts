import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { getApiBase, API_PREFIX } from './config';
import { getAccessToken, setAccessToken } from './token-store';
type AuthExpiredHandler = () => void;
let onAuthExpired: AuthExpiredHandler | null = null;
export function setAuthExpiredHandler(handler: AuthExpiredHandler | null) { onAuthExpired = handler; }
export const httpClient = axios.create({ baseURL: getApiBase(), withCredentials: true });
type AuthConfig = InternalAxiosRequestConfig & { _skipAuth?: boolean; _retry?: boolean };
let refreshInFlight: Promise<string | null> | null = null;
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const { data } = await axios.post(`${getApiBase()}${API_PREFIX}/admin/auth/refresh`, undefined, { withCredentials: true });
      const token: string = data.access_token;
      setAccessToken(token);
      return token;
    } catch { setAccessToken(null); return null; }
    finally { refreshInFlight = null; }
  })();
  return refreshInFlight;
}
httpClient.interceptors.request.use((config) => {
  const authConfig = config as AuthConfig;
  const token = getAccessToken();
  if (token && !authConfig._skipAuth) authConfig.headers.set('Authorization', `Bearer ${token}`);
  return config;
});
httpClient.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const config = error.config as AuthConfig | undefined;
  if (error.response?.status !== 401 || !config || config._skipAuth) return Promise.reject(error);
  if (config._retry) { onAuthExpired?.(); return Promise.reject(error); }
  config._retry = true;
  const token = await refreshAccessToken();
  if (!token) { onAuthExpired?.(); return Promise.reject(error); }
  config.headers.set('Authorization', `Bearer ${token}`);
  return httpClient.request(config);
});
interface ApiFetchOptions extends RequestInit { skipAuth?: boolean }
export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { skipAuth = false, headers, ...rest } = options;
  const isFormData = rest.body instanceof FormData;
  try {
    const response = await httpClient.request({
      url: path,
      method: rest.method ?? 'GET',
      data: rest.body,
      headers: { ...(rest.body && !isFormData ? { 'Content-Type': 'application/json' } : {}), ...(headers as Record<string, string> | undefined) },
      withCredentials: true,
      _skipAuth: skipAuth,
    } as AxiosRequestConfig & { _skipAuth: boolean });
    return new Response(response.status === 204 ? null : typeof response.data === 'string' ? response.data : JSON.stringify(response.data), { status: response.status, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    const failure = error as AxiosError;
    return new Response(JSON.stringify(failure.response?.data ?? { detail: failure.message }), { status: failure.response?.status ?? (failure.code === 'ERR_NETWORK' ? 503 : 500), headers: { 'Content-Type': 'application/json' } });
  }
}
