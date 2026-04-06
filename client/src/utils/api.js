import axios from "axios";
import { getApiBaseUrl } from "./env";

const api = axios.create({
  baseURL: getApiBaseUrl() || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;