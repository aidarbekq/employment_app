// ✅ Best Practice: централизованный Dashboard Redirect по роли через /dashboard
// Это позволяет фронтенду иметь один вход — "/dashboard" — для всех ролей
// и в будущем переиспользовать компонент на других страницах (например, в навигации)

// src/pages/DashboardRedirect.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case "ALUMNI":
      return <Navigate to="/graduate/profile" />;
    case "EMPLOYER":
      return <Navigate to="/employer/dashboard" />;
    case "ADMIN":
      return <Navigate to="/admin/dashboard" />;
    default:
      return <Navigate to="/" />;
  }
};

export default DashboardRedirect;

// ➕ Добавьте маршрут в App.tsx или routes.tsx
// import DashboardRedirect from "@/pages/DashboardRedirect";
// <Route path="/dashboard" element={<DashboardRedirect />} />;

// 🧭 Теперь в HomePage.tsx или навбаре можно сделать простую кнопку:
// <Link to="/dashboard">
//   <Button>Dashboard</Button>
// </Link>
