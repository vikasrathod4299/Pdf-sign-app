import axios from "axios";
import { LocalStorage } from "./util";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API,
});

apiClient.interceptors.request.use(
  function (config) {
    const user = LocalStorage.get("user");
    config.headers.Authorization = user?.token;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export const login = async (data) => {
  return await apiClient.post("/auth/login", data);
};
