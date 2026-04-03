import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://kongsi-cart-backend.vercel.app/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Backend demoAuth middleware requires these headers
  const userStr = localStorage.getItem('user');
  const demoUserId = sessionStorage.getItem('demoUserId');
  const demoUserRole = sessionStorage.getItem('demoUserRole');

  if (demoUserId && demoUserRole) {
    config.headers['X-Demo-Role'] = demoUserRole;
    config.headers['X-Demo-UserId'] = demoUserId;
  } else if (userStr) {
    try {
      const user = JSON.parse(userStr);
      config.headers['X-Demo-Role'] = user.role || 'buyer';
      config.headers['X-Demo-UserId'] = user._id || user.id || '';
    } catch {
      // fallback if user data is malformed
      config.headers['X-Demo-Role'] = 'buyer';
    }
  } else {
    config.headers['X-Demo-Role'] = 'buyer';
  }

  return config;
});

export default api;
