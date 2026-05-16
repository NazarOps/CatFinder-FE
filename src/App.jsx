import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AdvertisementsPage from "./pages/AdvertisementsPage";
import AdvertisementDetailsPage from "./pages/AdvertisementDetailsPage";
import CreateAdvertisementPage from "./pages/CreateAdvertisementPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SavedAdvertisementsPage from "./pages/SavedAdvertisementsPage";
import NotFoundPage from "./pages/NotFoundPage";

// App - huvudkomponent med alla routes
export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/advertisements" element={<AdvertisementsPage />} />
        <Route
          path="/advertisements/:id"
          element={<AdvertisementDetailsPage />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/advertisements/create"
          element={
            <ProtectedRoute>
              <CreateAdvertisementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedAdvertisementsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
