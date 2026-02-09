import axios from "axios";
const BACKEND_URL = "http://localhost:5000/api/v1"; 

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, 
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      
      if (originalRequest.url.includes("/auth/login")) {
        return Promise.reject(error);
      }

      console.warn("Session expired or invalid token. Redirecting to login...");
      
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;