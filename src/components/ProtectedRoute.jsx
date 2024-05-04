import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const data = localStorage.getItem("user");

  const user = data ? JSON.parse(data) : null;

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
