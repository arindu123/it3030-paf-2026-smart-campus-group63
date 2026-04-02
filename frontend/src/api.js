import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8082"
});

// Request interceptor — every request ට token add කරනවා
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("sc_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — 401 ආවොත් login ට redirect
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem("sc_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
