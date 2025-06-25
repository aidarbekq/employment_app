import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Building, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [employmentRate, setEmploymentRate] = useState<number | null>(null);
  const [totalGraduates, setTotalGraduates] = useState<number | null>(null);
  const [totalEmployers, setTotalEmployers] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('analytics/employment-stats/');
        const data = res.data;

        let total = 0;
        let employed = 0;

        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'meta' && typeof value === 'object') {
            total += value.total;
            employed += value.employed;
          }
        });

        const rate = total > 0 ? Math.round((employed / total) * 100) : 0;
        setEmploymentRate(rate);
        setTotalGraduates(total);
        setTotalEmployers(data.meta?.total_employers ?? null);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 bg-[url('https://scontent-hel3-1.xx.fbcdn.net/v/t39.30808-6/484180283_1136202744969487_8270886603001842588_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_ohc=O2aBccBO67YQ7kNvwGnHib5&_nc_oc=AdmXXK9SauFNKRQWFO6IH5sS-5Y40GsInuCdBI4Ek1wkJSgNCxfCYR6jbFTilrvPFwg&_nc_zt=23&_nc_ht=scontent-hel3-1.xx&_nc_gid=lpbaV__NxGulWXSYRFK93g&oh=00_AfOD4OaplFUmjYmReXQbAg0fV6IDOjKhLg4g_z0KnuacHA&oe=685E0FE9')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {t('home.heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              {t('home.heroSubtitle')}
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t('nav.register')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-800"
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
            {t('home.statsTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="transform transition-transform hover:-translate-y-2">
              <CardContent className="text-center p-8">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-primary-100 p-4">
                    <BarChart3 className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-primary-600 mb-2">
                  {employmentRate !== null ? `${employmentRate}%` : '—'}
                </h3>
                <p className="text-gray-600">{t('home.employmentRate')}</p>
              </CardContent>
            </Card>

            <Card className="transform transition-transform hover:-translate-y-2">
              <CardContent className="text-center p-8">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-secondary-100 p-4">
                    <Users className="h-8 w-8 text-secondary-600" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-secondary-600 mb-2">
                  {totalGraduates !== null ? `${totalGraduates}+` : '—'}
                </h3>
                <p className="text-gray-600">{t('home.totalGraduates')}</p>
              </CardContent>
            </Card>

            <Card className="transform transition-transform hover:-translate-y-2">
              <CardContent className="text-center p-8">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-accent-100 p-4">
                    <Building className="h-8 w-8 text-accent-600" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-accent-600 mb-2">
                  {totalEmployers !== null ? `${totalEmployers}+` : '—'}
                </h3>
                <p className="text-gray-600">{t('home.partnerCompanies')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
            {t('home.Features')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="h-full">
              <CardContent>
                <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('home.Graduate Profiles')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('home.Create your profile, add your work experience, or upload your resume to find better opportunities.')}
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent>
                <div className="rounded-full bg-secondary-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('home.Job Listings')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('home.Employers can post job vacancies and find suitable candidates from our pool of qualified graduates.')}
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent>
                <div className="rounded-full bg-accent-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('home.Employment Analytics')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('home.Access detailed analytics about graduate employment rates, popular industries, and salary trends.')}
                </p>
              </CardContent>
            </Card>
          </div>

          {!user && (
            <div className="text-center mt-12">
              <Link to="/register">
                <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
                  {t('home.Get Started')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
            {t('home.Our Partners')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-70">
            <div className="text-xl font-bold text-gray-400">Company A</div>
            <div className="text-xl font-bold text-gray-400">Company B</div>
            <div className="text-xl font-bold text-gray-400">Company C</div>
            <div className="text-xl font-bold text-gray-400">Company D</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
