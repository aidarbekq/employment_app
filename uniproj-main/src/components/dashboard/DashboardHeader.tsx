import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Globe, Menu } from 'lucide-react';

interface DashboardHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ setSidebarOpen }) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const toggleLanguageMenu = () => {
    setLanguageMenuOpen(!languageMenuOpen);
  };

  const changeLanguage = (lang: 'en' | 'ru' | 'kg') => {
    setLanguage(lang);
    setLanguageMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Burger + Title */}
        <div className="flex items-center space-x-3">
          <button
            className="sm:hidden text-gray-600 hover:text-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {user?.role === 'admin' && t('admin.dashboard')}
            {user?.role === 'employer' && t('employer.dashboard')}
            {user?.role === 'graduate' && t('graduate.profile')}
          </h1>
        </div>

        {/* Language selector only */}
        <div className="relative">
          <button
            onClick={toggleLanguageMenu}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors flex items-center"
          >
            <Globe className="h-5 w-5" />
            <span className="ml-1 text-sm font-medium">{language.toUpperCase()}</span>
          </button>

          {languageMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
              {(['en', 'ru', 'kg'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`block px-4 py-2 text-sm text-left w-full ${
                    language === lang
                      ? 'bg-gray-100 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'ru' ? 'Русский' : 'Кыргызча'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
