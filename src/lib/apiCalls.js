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
  return await apiClient.post(`/auth/login`, data);
};
export const login2 = async (data) => {
  return await axios.post(
    `${import.meta.env.VITE_MIRACLE_SERVER_API}/login`,
    data
  );
};
export const register = async (data) => {
  return await apiClient.post("/auth/register", data);
};

export const sendDoc = async (data) => {
  const formData = new FormData();

  formData.append("email", data.email);

  data.docs.forEach((item, index) => {
    formData.append(`pdfs[${index}].pdf`, item.pdf);
    item.coordinates.forEach((c, cIndex) => {
      formData.append(`pdfs[${index}][coordinates][${cIndex}][top]`, c.top);
      formData.append(`pdfs[${index}][coordinates][${cIndex}][left]`, c.left);
      formData.append(`pdfs[${index}][coordinates][${cIndex}][page]`, c.page);
      formData.append(`pdfs[${index}][coordinates][${cIndex}][type]`, c.type);
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
  formData.append("id", data.id);
  data.docs.map((item, index) => {
    formData.append(`docs[${index}].doc`, item);
  });
  return await apiClient.put(`/doc/${data.id}/${data.docs.length}`, formData);
};
