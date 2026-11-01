// src/routes/PrivateRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "@/lib/auth";

type Props = { children: React.ReactNode };

// Only hides admin pages from visitors; the real protection is the API refusing any
// change without a valid admin token.
const PrivateRoute: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  return isLoggedIn() ? (
    <>{children}</>
  ) : (
    <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  );
};

export default PrivateRoute;
