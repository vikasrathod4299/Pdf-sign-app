import React from "react";
import { Navigate, Outlet } from "react-router";
import Login from "../pages/Login";

const ProtectedRoute = () => {
  const data = localStorage.getItem("user");

  const user = data ? JSON.parse(data) : null;

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
