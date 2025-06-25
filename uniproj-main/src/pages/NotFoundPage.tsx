import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4 mb-6">
          {t('Page Not Found')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('The page you are looking for does not exist or has been moved.')}
        </p>
        <Link to="/">
          <Button 
            leftIcon={<Home className="h-5 w-5" />} 
            size="lg"
          >
            {t('Back to Home')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;