// src/routes/PrivateRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

type Props = { children: React.ReactNode };

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const authed = sessionStorage.getItem("isAuthenticated") === "true";
  return authed ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
