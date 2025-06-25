import React from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-semibold text-white">{t('app.name')}</span>
            </div>
            <p className="text-gray-400 mb-4">{t('app.tagline')}</p>
          </div>

          {/* Contact information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-gray-700 pb-2">
              {t('footer.Contact Us')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-400 mr-3 mt-0.5" />
                <span className="text-gray-400">
                  Polytechnic University, Bishkek, Kyrgyzstan
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary-400 mr-3" />
                <span className="text-gray-400">+996 312 12 34 56</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary-400 mr-3" />
                <span className="text-gray-400">info@polytech.kg</span>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-gray-700 pb-2">
              {t('footer.Quick Links')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  {t('footer.About University')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  {t('footer.Career Center')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  {t('footer.Academic Programs')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  {t('footer.Privacy Policy')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  {t('footer.Terms of Service')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-400">
          <p>
            © {currentYear} {t('app.name')} - {t('footer.All Rights Reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;