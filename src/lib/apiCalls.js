import axios from "axios";
import { LocalStorage } from "./util";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API,
});

apiClient.interceptors.request.use(
  function (config) {
    const user = LocalStorage.get("user");
    config.headers.Authorization = `Bearer ${user?.token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export const login = async (data) => {
  return await apiClient.post("/auth/login", data);
};

export const sendDoc = async (data) => {
  const formData = new FormData();
  formData.append("doc", data.doc);
  formData.append("email", data.email);
  data.coordinates.forEach((item, index) => {
    for (const [key, value] of Object.entries(item)) {
      formData.append(`coordinates[${index}][${key}]`, value);
    }
  });
  return await apiClient.post("/doc", formData);
};

export const getReviewDocuments = async ({ queryKey }) => {
  return await apiClient.get(`/doc/reviewDocs`);
};

export const getDocToSign = async ({ queryKey }) => {
  const [key, id] = queryKey;
  return await apiClient.get(`/doc/${id}`);
};

export const getPdf = async ({ queryKey }) => {
  const [key, url] = queryKey;
  return await apiClient.get(`/uploads/${url}`);
};
