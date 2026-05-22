import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || user?.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
