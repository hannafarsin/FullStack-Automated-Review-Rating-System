import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // authentication logics here
  const isAuthenticated = false;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
