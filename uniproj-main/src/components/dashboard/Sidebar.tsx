import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  User,
  FileText,
  Briefcase,
  BarChart,
  Building,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  role: 'graduate' | 'employer' | 'admin';
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={clsx(
        'flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors',
        isActive(to) ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  const renderLinks = () => {
    switch (role) {
      case 'graduate':
        return (
          <>
            <NavLink to="/graduate/profile" icon={<User className="h-5 w-5" />} label={t('graduate.profile')} />
            <NavLink to="/graduate/resume" icon={<FileText className="h-5 w-5" />} label={t('graduate.resume')} />
            <NavLink to="/graduate/vacancies" icon={<FileText className="h-5 w-5" />} label={t('admin.vacanciesManagement')} />
          </>
        );
      case 'employer':
        return (
          <>
            <NavLink to="/employer/dashboard" icon={<BarChart className="h-5 w-5" />} label={t('employer.dashboard')} />
            <NavLink to="/employer/vacancies" icon={<Briefcase className="h-5 w-5" />} label={t('employer.vacancies')} />
            <NavLink to="/employer/graduates" icon={<GraduationCap className="h-5 w-5" />} label={t('employer.graduates')} />
          </>
        );
      case 'admin':
        return (
          <>
            <NavLink to="/admin/dashboard" icon={<BarChart className="h-5 w-5" />} label={t('admin.dashboard')} />
            <NavLink to="/admin/graduates" icon={<GraduationCap className="h-5 w-5" />} label={t('admin.graduatesManagement')} />
            <NavLink to="/admin/employers" icon={<Building className="h-5 w-5" />} label={t('admin.employersManagement')} />
            <NavLink to="/admin/vacancies" icon={<Briefcase className="h-5 w-5" />} label={t('admin.vacanciesManagement')} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={clsx(
          'sm:relative z-40 h-full sm:h-screen bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out',
          'w-64',
          isOpen ? 'fixed translate-x-0 top-0 left-0' : 'fixed -translate-x-full top-0 left-0 sm:translate-x-0 sm:relative'
        )}
      >
        <div className="p-4 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary-600" />
            <span className="text-lg font-semibold text-primary-700">{t('app.name')}</span>
          </Link>
        </div>

        <nav className="mt-6 px-3 space-y-1">{renderLinks()}</nav>

        <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="flex items-center space-x-2 px-4 py-2 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
