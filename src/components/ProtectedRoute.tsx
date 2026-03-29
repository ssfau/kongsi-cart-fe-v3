import { Navigate, Outlet } from "react-router-dom";

export const HandlerProtectedRoute = () => {
  const userId = sessionStorage.getItem("demoUserId");
  const userRole = sessionStorage.getItem("demoUserRole");

  if (!userId || userRole !== "handler") {
    return <Navigate to="/seller/login" replace />;
  }

  return <Outlet />;
};
