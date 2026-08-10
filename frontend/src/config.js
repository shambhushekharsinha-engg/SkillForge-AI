const rawApi = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const rawWs = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const API_BASE_URL = rawApi.replace(/\/+$/, '');
export const WS_BASE_URL = rawWs.replace(/\/+$/, '');
