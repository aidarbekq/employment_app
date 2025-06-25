import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GraduateProfilePage from './pages/graduate/ProfilePage';
import GraduateResumePage from './pages/graduate/ResumePage';
import GraduateVacanciesPage from './pages/graduate/VacanciesPage';
import EmployerVacanciesPage from './pages/employer/VacanciesPage';
import VacancyCreatePage from "./pages/employer/VacancyCreatePage";
import VacancyEditPage from "./pages/employer/VacancyEditPage";
import EmployerPage from './pages/employer/EmployerPage';
import EmployerGraduatesPage from './pages/employer/GraduatesPage';
import EmployerGraduateDetailPage from './pages/employer/GraduatesDetailPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminGraduatesPage from './pages/admin/GraduatesPage';
import AdminGraduateDetailPage from './pages/admin/AdminGraduateDetailPage';
import AdminEmployerDetailPage from './pages/admin/AdminEmployerDetailPage';
import AdminEmployersPage from './pages/admin/EmployersPage';
import AdminVacanciesPage from './pages/admin/AdminVacanciesPage';
import AdminVacancyDetailPage from './pages/admin/AdminVacancyDetailPage';
import AdminVacancyEditPage from './pages/admin/AdminVacancyEditPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardRedirect from "@/pages/DashboardRedirect";
import GraduateVacancyDetailPage from './pages/graduate/VacanciesDetailPage';


function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
          </Route>

          {/* Graduate routes */}
          <Route path="/graduate" element={<DashboardLayout role="graduate" />}>
            <Route path="profile" element={<GraduateProfilePage />} />
            <Route path="resume" element={<GraduateResumePage />} />
            <Route path="vacancies" element={<GraduateVacanciesPage />} />
            <Route path="vacancies/:id" element={<GraduateVacancyDetailPage />} />
          </Route>

          {/* Employer routes */}
          <Route path="/employer" element={<DashboardLayout role="employer" />}>
            <Route path="dashboard" element={<EmployerPage />} />
            <Route path="graduates" element={<EmployerGraduatesPage />} />
            <Route path="graduates/:id" element={<EmployerGraduateDetailPage/>} />
            <Route path="vacancies" element={<EmployerVacanciesPage />} />
            <Route path="vacancies/create" element={<VacancyCreatePage />} />
            <Route path="vacancies/:id/edit" element={<VacancyEditPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="graduates" element={<AdminGraduatesPage />} />
            <Route path="graduates/:id" element={<AdminGraduateDetailPage />} />
            <Route path="employers" element={<AdminEmployersPage />} />
            <Route path='employers/:id' element={<AdminEmployerDetailPage/>}/>
            <Route path='vacancies' element={<AdminVacanciesPage/>}/>
            <Route path='vacancies/:id' element={<AdminVacancyDetailPage/>}/>
            <Route path="vacancies/:id/edit" element={<AdminVacancyEditPage />} />
          </Route>

          {/* Not found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;
