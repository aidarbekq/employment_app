import axios from "axios";

const api = axios.create({
  baseURL: "/api/",
});

// Автоматически подставлять токен из localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Если токен просрочен — можно добавить обновление через refresh_token
// (необязательно на этом этапе)

export default api;
