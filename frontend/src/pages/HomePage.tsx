import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Building, ExternalLink, Landmark, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

interface EmploymentStatsEntry {
  total: number;
  employed: number;
}

interface EmploymentStatsResponse {
  meta?: {
    total_employers?: number;
  };
  [year: string]: EmploymentStatsEntry | { total_employers?: number } | undefined;
}

interface Partner {
  id: number;
  name: string;
  description: string;
  website: string;
  logo_url: string | null;
}

const heroModules = import.meta.glob('../assets/hero.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const heroImage = Object.values(heroModules)[0] as string | undefined;

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [employmentRate, setEmploymentRate] = useState<number | null>(null);
  const [totalGraduates, setTotalGraduates] = useState<number | null>(null);
  const [totalEmployers, setTotalEmployers] = useState<number | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isHeroImageAvailable, setIsHeroImageAvailable] = useState(Boolean(heroImage));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('analytics/employment-stats/');
        const data = res.data as EmploymentStatsResponse;

        let total = 0;
        let employed = 0;

        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'meta' && value && 'total' in value && 'employed' in value) {
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

    const fetchPartners = async () => {
      try {
        const res = await api.get('employers/partners/');
        setPartners(res.data as Partner[]);
      } catch (error) {
        console.error('Failed to load partners:', error);
      }
    };

    fetchStats();
    fetchPartners();
  }, []);

  const hasHeroImage = Boolean(heroImage && isHeroImageAvailable);

  return (
    <div className="animate-fade-in">
      <section className="relative bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        {hasHeroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}

        {heroImage && (
          <img
            src={heroImage}
            alt=""
            className="hidden"
            aria-hidden="true"
            onError={() => setIsHeroImageAvailable(false)}
          />
        )}

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-primary-100 mb-6 backdrop-blur-sm">
              <Landmark className="h-4 w-4" />
              {t('home.departmentBadge')}
            </div>
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

      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-2">
                {t('home.departmentLabel')}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {t('home.departmentTitle')}
              </h2>
              <p className="text-gray-600 leading-7">{t('home.departmentDescription')}</p>
            </div>
            <div className="rounded-2xl bg-primary-50 p-6 border border-primary-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">{t('home.directionCode')}</p>
                  <p className="font-semibold text-gray-900">710200</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('home.institute')}</p>
                  <p className="font-semibold text-gray-900">{t('home.instituteName')}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-gray-500">{t('home.mainProfiles')}</p>
                  <p className="font-semibold text-gray-900">{t('home.mainProfilesText')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800">
            {t('home.Our Partners')}
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            {t('home.partnersDescription')}
          </p>

          {partners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <Card key={partner.id} className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center overflow-hidden text-primary-700 font-bold">
                        {partner.logo_url ? (
                          <img src={partner.logo_url} alt={partner.name} className="h-full w-full object-contain p-2" />
                        ) : (
                          partner.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                        {partner.website && (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary-600 hover:underline"
                          >
                            {t('home.partnerWebsite')}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-6 flex-1">{partner.description || t('common.notSpecified')}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-70">
              {['Тумар Тех', 'Ала-Тоо Digital', 'Ынтымак Telecom', 'Манас Cloud'].map((name) => (
                <div key={name} className="text-xl font-bold text-gray-400">{name}</div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
