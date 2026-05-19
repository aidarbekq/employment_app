// src/components/layout/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Menu, X, LogOut, Globe } from 'lucide-react';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleLanguageMenu = () => setLanguageMenuOpen(!languageMenuOpen);

  const changeLanguage = (lang: 'en' | 'ru' | 'kg') => {
    if (lang !== language) {
      setLanguage(lang);
    }
    setLanguageMenuOpen(false);
  };

  // Close language menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };
    if (languageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [languageMenuOpen]);

  return (
    <header className="bg-white shadow-sm z-50 relative">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-semibold text-primary-700">{t('app.name')}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.home')}
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}

            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={toggleLanguageMenu}
                className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Globe className="h-5 w-5 mr-1" />
                {language.toUpperCase()}
              </button>
              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-24 bg-white rounded-md shadow-lg py-1 z-50">
                  {['en', 'ru', 'kg'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => changeLanguage(lang as 'en' | 'ru' | 'kg')}
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        language === lang ? 'bg-gray-100' : 'hover:bg-gray-100'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button onClick={toggleMobileMenu} className="md:hidden text-gray-700 z-50">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 py-3 border-t z-40 relative">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors inline-block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}

              {/* Language options */}
              <div className="pt-2 border-t">
                <div className="flex space-x-4">
                  {['en', 'ru', 'kg'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        changeLanguage(lang as 'en' | 'ru' | 'kg');
                        setMobileMenuOpen(false);
                      }}
                      className={`px-2 py-1 text-sm rounded ${
                        language === lang ? 'bg-gray-200' : ''
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
