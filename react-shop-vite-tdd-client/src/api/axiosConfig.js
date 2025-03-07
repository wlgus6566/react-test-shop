import axios from 'axios';

const BASE_URL = 'http://localhost:5003';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 인증 에러 처리
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 