import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// ✅ Pinia 초기화 전에 useHostStore() 호출하면 에러남
// → baseURL을 환경변수로 직접 처리
// 개발: VITE_API_HOST 없음 → '' + '/api' = '/api' → Vite proxy → Spring 9090
// 운영: VITE_API_HOST=https://서버주소 → 'https://서버주소/api'
const BASE_URL = (import.meta.env.VITE_API_HOST || '') + '/api';

const http = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터
http.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.auth.token) {
            config.headers.Authorization = `Bearer ${authStore.auth.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터
http.interceptors.response.use(
    (response) => {
        if (response.config.responseType === 'blob') return response;
        return response.data;
    },
    async (error) => {
        const authStore = useAuthStore();
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.post(`${BASE_URL}/auth/refresh`, {
                    accessToken: authStore.auth.token,
                    refreshToken: authStore.auth.refreshToken
                });
                if (res.status === 200) {
                    const newToken = res.data.accessToken;
                    authStore.updateToken(newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return http(originalRequest);
                }
            } catch (refreshError) {
                authStore.logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default http;