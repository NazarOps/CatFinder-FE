import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useSoundStore } from "./store/soundStore";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import AdminProtectedRoute from "./components/routing/AdminProtectedRoute";
import HomePage from "./pages/HomePage";
import AdvertisementsPage from "./pages/AdvertisementsPage";
import AdvertisementDetailsPage from "./pages/AdvertisementDetailsPage";
import CreateAdvertisementPage from "./pages/CreateAdvertisementPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SavedAdvertisementsPage from "./pages/SavedAdvertisementsPage";
import MyAdvertisementsPage from "./pages/MyAdvertisementsPage";
import AdminPortalPage from "./pages/AdminPortalPage";
import NotFoundPage from "./pages/NotFoundPage";

// App - huvudkomponent med alla routes
export default function App() {
  const soundEnabled = useSoundStore((s) => s.soundEnabled);

  useEffect(() => {
    let ctx = null;

    function playClick() {
      if (!soundEnabled) return;
      try {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
      } catch (_) {}
    }

    function handleClick(e) {
      const target = e.target.closest("button.btn, a.btn, .admin-filter-btn, .navbar-links a");
      if (!target) return;
      playClick();
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [soundEnabled]);

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
        <Route
          path="/my-advertisements"
          element={
            <ProtectedRoute>
              <MyAdvertisementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminPortalPage />
            </AdminProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
