const rawApi = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_BASE_URL = rawApi.replace(/\/+$/, '');
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');
