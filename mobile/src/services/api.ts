import axios from "axios";
import { supabase } from "./supabase";

const url = __DEV__
  ? process.env.EXPO_PUBLIC_LOCAL_API_URL
  : process.env.EXPO_PUBLIC_PROD_API_URL;

const urlComplete =
  url?.endsWith('/api')
    ? url
    : `${url}/api`;


const api = axios.create({
  baseURL: urlComplete,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use(
  async (config) => {

    const {
      data: { session }
    } = await supabase.auth.getSession();

    console.log("SESSION:", session);


    const token =
      session?.access_token;

      console.log("TOKEN:", token);

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;