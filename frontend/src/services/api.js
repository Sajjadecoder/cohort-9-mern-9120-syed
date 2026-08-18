import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const saveAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    return;
  }

  localStorage.removeItem("token");
};

export const clearAuthToken = () => {
  localStorage.removeItem("token");
};

export default api;
