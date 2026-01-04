import { Navigate, Outlet } from "react-router-dom";

function isTokenValid() {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  try {
    // Decode JWT payload
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000;
    return Date.now() < expiry;
  } catch {
    return false;
  }
}

export default function ProtectedRoute() {
  const valid = isTokenValid();

  return valid ? <Outlet /> : <Navigate to="/login" replace />;
}
