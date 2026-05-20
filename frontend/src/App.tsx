import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';

// Layouts
const MainLayout = lazy(() => import('./layouts/MainLayout'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));

// Public pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const DashboardRedirect = lazy(() => import('@/pages/DashboardRedirect'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));

// Graduate pages
const GraduateProfilePage = lazy(() => import('./pages/graduate/ProfilePage'));
const GraduateResumePage = lazy(() => import('./pages/graduate/ResumePage'));
const GraduateVacanciesPage = lazy(() => import('./pages/graduate/VacanciesPage'));
const GraduateVacancyDetailPage = lazy(() => import('./pages/graduate/VacanciesDetailPage'));

// Employer pages
const EmployerPage = lazy(() => import('./pages/employer/EmployerPage'));
const EmployerGraduatesPage = lazy(() => import('./pages/employer/GraduatesPage'));
const EmployerGraduateDetailPage = lazy(() => import('./pages/employer/GraduatesDetailPage'));
const EmployerVacanciesPage = lazy(() => import('./pages/employer/VacanciesPage'));
const VacancyCreatePage = lazy(() => import('./pages/employer/VacancyCreatePage'));
const VacancyEditPage = lazy(() => import('./pages/employer/VacancyEditPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminGraduatesPage = lazy(() => import('./pages/admin/GraduatesPage'));
const AdminGraduateDetailPage = lazy(() => import('./pages/admin/AdminGraduateDetailPage'));
const AdminGraduateCreatePage = lazy(() => import('./pages/admin/AdminGraduateCreatePage'));
const AdminEmployersPage = lazy(() => import('./pages/admin/EmployersPage'));
const AdminEmployerDetailPage = lazy(() => import('./pages/admin/AdminEmployerDetailPage'));
const AdminVacanciesPage = lazy(() => import('./pages/admin/AdminVacanciesPage'));
const AdminVacancyDetailPage = lazy(() => import('./pages/admin/AdminVacancyDetailPage'));
const AdminVacancyEditPage = lazy(() => import('./pages/admin/AdminVacancyEditPage'));
const AdminPartnersPage = lazy(() => import('./pages/admin/PartnersPage'));
const AdminGroupsPage = lazy(() => import('./pages/admin/GroupsPage'));
const AdminUserPasswordPage = lazy(() => import('./pages/admin/AdminUserPasswordPage'));
const AdminEmployerCreatePage = lazy(() => import('./pages/admin/AdminEmployerCreatePage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-500">
    Loading...
  </div>
);

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
            </Route>

            {/* Graduate routes */}
            <Route path="/graduate" element={<DashboardLayout role="graduate" />}>
              <Route path="profile" element={<GraduateProfilePage />} />
              <Route path="resume" element={<GraduateResumePage />} />
              <Route path="security" element={<ChangePasswordPage />} />
              <Route path="vacancies" element={<GraduateVacanciesPage />} />
              <Route path="vacancies/:id" element={<GraduateVacancyDetailPage />} />
            </Route>

            {/* Employer routes */}
            <Route path="/employer" element={<DashboardLayout role="employer" />}>
              <Route path="dashboard" element={<EmployerPage />} />
              <Route path="graduates" element={<EmployerGraduatesPage />} />
              <Route path="graduates/:id" element={<EmployerGraduateDetailPage />} />
              <Route path="vacancies" element={<EmployerVacanciesPage />} />
              <Route path="security" element={<ChangePasswordPage />} />
              <Route path="vacancies/create" element={<VacancyCreatePage />} />
              <Route path="vacancies/:id/edit" element={<VacancyEditPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<DashboardLayout role="admin" />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="graduates" element={<AdminGraduatesPage />} />
              <Route path="graduates/create" element={<AdminGraduateCreatePage />} />
              <Route path="graduates/:id" element={<AdminGraduateDetailPage />} />
              <Route path="employers" element={<AdminEmployersPage />} />
              <Route path="employers/create" element={<AdminEmployerCreatePage />} />
              <Route path="employers/:id" element={<AdminEmployerDetailPage />} />
              <Route path="users/:userId/password" element={<AdminUserPasswordPage />} />
              <Route path="vacancies" element={<AdminVacanciesPage />} />
              <Route path="vacancies/:id" element={<AdminVacancyDetailPage />} />
              <Route path="vacancies/:id/edit" element={<AdminVacancyEditPage />} />
              <Route path="partners" element={<AdminPartnersPage />} />
              <Route path="groups" element={<AdminGroupsPage />} />
            </Route>

            {/* Not found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </I18nextProvider>
  );
}

export default App;
