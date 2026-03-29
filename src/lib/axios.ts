import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const userId = localStorage.getItem("userId") || "demo-handler-001";
  config.headers["X-Demo-Role"] = "handler";
  config.headers["X-Demo-UserId"] = userId;
  return config;
});

export default api;
