import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("user");
  let role = "customer"; // default fallback for buyers
  let userId = "demo-buyer-001"; 

  // Check session storage from seller login first
  const sessionUserId = sessionStorage.getItem("demoUserId");
  const sessionUserRole = sessionStorage.getItem("demoUserRole");
  
  const isHandlerRoute = window.location.pathname.includes("/handler") || window.location.pathname.includes("/seller");

  if (isHandlerRoute && sessionUserId && sessionUserRole) {
    userId = sessionUserId;
    role = sessionUserRole;
  } else if (storedUser) {
    try {
      const userObj = JSON.parse(storedUser);
      role = userObj.role || "customer";
      userId = userObj.id || userObj._id || "demo-buyer-001";
    } catch (e) {
      // ignore JSON parse error
    }
  }

  config.headers["X-Demo-Role"] = role;
  config.headers["X-Demo-UserId"] = userId;
  
  // also support Bearer token if it exists
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;
