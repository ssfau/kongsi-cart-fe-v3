import { Navigate, Outlet } from "react-router-dom";

export const HandlerProtectedRoute = () => {
  const userId = localStorage.getItem("demoUserId");
  const userRole = localStorage.getItem("demoUserRole");

  if (!userId || userRole !== "handler") {
    return <Navigate to="/seller/login" replace />;
  }

  return <Outlet />;
};
