import axios from "axios";

const url = __DEV__
  ? process.env.EXPO_PUBLIC_LOCAL_API_URL
  : process.env.EXPO_PUBLIC_PROD_API_URL;

const api = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = ""; // replace with your token from storage later
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;