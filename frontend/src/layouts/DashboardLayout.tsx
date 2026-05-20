import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

interface DashboardLayoutProps {
  role: "graduate" | "employer" | "admin";
}

const ROLE_MAP = {
  graduate: "ALUMNI",
  employer: "EMPLOYER",
  admin: "ADMIN",
} as const;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== ROLE_MAP[role])) {
      navigate("/login");
    }
  }, [loading, navigate, role, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar: mobile responsive */}
        <Sidebar role={role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader setSidebarOpen={setIsSidebarOpen} />
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
};

export default DashboardLayout;
