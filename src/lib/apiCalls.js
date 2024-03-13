import axios from "axios";
import { LocalStorage } from "./util";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
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
