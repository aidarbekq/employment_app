import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { LanguageProvider } from '../contexts/LanguageContext';

const MainLayout: React.FC = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default MainLayout;