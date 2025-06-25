import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

interface DashboardLayoutProps {
  role: "graduate" | "employer" | "admin";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const roleMap = {
    graduate: "ALUMNI",
    employer: "EMPLOYER",
    admin: "ADMIN",
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== roleMap[role])) {
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
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
};

export default DashboardLayout;
