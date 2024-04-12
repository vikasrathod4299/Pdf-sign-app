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
export const register = async (data) => {
  return await apiClient.post("/auth/register", data);
};

export const sendDoc = async (data) => {
  const formData = new FormData();

  formData.append("email", data.email);
  data.docs.forEach((item, index) => {
    formData.append(`docs[${index}].doc`, item.doc);
    item.coordinates.forEach((c, cIndex) => {
      formData.append(`docs[${index}].coordinates[${cIndex}].top`, c.top);
      formData.append(`docs[${index}].coordinates[${cIndex}].left`, c.left);
      formData.append(`docs[${index}].coordinates[${cIndex}].page`, c.page);
      formData.append(`docs[${index}].coordinates[${cIndex}].type`, c.type);
    });
  });

  return await apiClient.post(`/doc/${data.docs.length}`, formData);
};

export const getReviewDocuments = async () => {
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

export const addSign = async (data) => {
  const formData = new FormData();
  console.log(data);
  formData.append("doc", data.doc);
  return await apiClient.put(`/doc/${data.id}`, formData);
};
