import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  ExternalLink,
  GraduationCap,
  Handshake,
  Landmark,
  Network,
  Sparkles,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
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

const PARTNERS_LIMIT = 6;

const fallbackPartners = ['Тумар Тех', 'Ала-Тоо Digital', 'Ынтымак Telecom', 'Манас Cloud'];

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

        setEmploymentRate(total > 0 ? Math.round((employed / total) * 100) : 0);
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
  const visiblePartners = useMemo(() => partners.slice(0, PARTNERS_LIMIT), [partners]);
  const hiddenPartnersCount = Math.max(partners.length - PARTNERS_LIMIT, 0);

  const statsCards = [
    {
      label: t('home.employmentRate'),
      value: employmentRate !== null ? `${employmentRate}%` : '—',
      icon: <TrendingUp className="h-7 w-7" />,
      accent: 'text-primary-600',
      bg: 'bg-primary-50',
      ring: 'ring-primary-100',
    },
    {
      label: t('home.totalGraduates'),
      value: totalGraduates !== null ? `${totalGraduates}+` : '—',
      icon: <UsersRound className="h-7 w-7" />,
      accent: 'text-secondary-600',
      bg: 'bg-secondary-50',
      ring: 'ring-secondary-100',
    },
    {
      label: t('home.partnerCompanies'),
      value: totalEmployers !== null ? `${totalEmployers}+` : '—',
      icon: <Handshake className="h-7 w-7" />,
      accent: 'text-accent-600',
      bg: 'bg-accent-50',
      ring: 'ring-accent-100',
    },
  ];

  const programCards = [
    {
      label: t('home.directionCode'),
      code: '710200',
      text: t('home.directionNameIst'),
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      label: t('home.directionCodeAdditional'),
      code: '690300',
      text: t('home.directionNamePzi'),
      icon: <Network className="h-5 w-5" />,
    },
  ];

  return (
    <div className="animate-fade-in bg-white">
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        {hasHeroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/60 via-primary-900/35 to-primary-800/70" />
        <div className="absolute -right-24 top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl" />

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
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-primary-100 mb-6 backdrop-blur-sm border border-white/10">
              <Landmark className="h-4 w-4" />
              {t('home.departmentBadge')}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100 leading-8 max-w-3xl">
              {t('home.heroSubtitle')}
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary-950/20">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-800"
                  >
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7">
            {statsCards.map((item) => (
              <Card key={item.label} className="group overflow-hidden rounded-3xl border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-3">{item.label}</p>
                      <h3 className={`text-4xl md:text-5xl font-bold ${item.accent}`}>{item.value}</h3>
                    </div>
                    <div className={`rounded-2xl ${item.bg} ${item.accent} p-4 ring-1 ${item.ring} group-hover:scale-105 transition-transform`}>
                      {item.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-14 md:pb-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="rounded-[2rem] border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-accent-50 p-5 md:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-8 items-stretch">
              <div className="rounded-3xl bg-primary-700 p-6 md:p-8 text-white overflow-hidden relative">
                <div className="absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-white/10" />
                <div className="relative">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-sm uppercase tracking-wide text-primary-100 font-semibold mb-3">
                    {t('home.departmentLabel')}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                    {t('home.departmentTitle')}
                  </h2>
                  <p className="text-primary-50 leading-7">
                    {t('home.departmentDescription')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {programCards.map((item) => (
                    <div key={item.code} className="rounded-3xl bg-white p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                          {item.icon}
                        </div>
                        <p className="text-sm font-medium text-gray-500">{item.label}</p>
                      </div>
                      <p className="text-3xl font-bold text-primary-700 mb-2">{item.code}</p>
                      <p className="text-sm leading-6 text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-accent-50 p-3 text-accent-700">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">{t('home.institute')}</p>
                      <p className="text-lg font-semibold text-gray-900">{t('home.instituteName')}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {[t('home.fullTime'), t('home.partTime'), t('home.bachelor'), t('home.master')].map((item) => (
                          <span key={item} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-2">
                {t('home.partnersLabel')}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t('home.Our Partners')}
              </h2>
            </div>
            {hiddenPartnersCount > 0 && (
              <span className="inline-flex w-fit items-center rounded-full bg-white border border-gray-200 px-4 py-2 text-sm text-gray-600 shadow-sm">
                {t('home.morePartners', { count: hiddenPartnersCount })}
              </span>
            )}
          </div>

          {partners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visiblePartners.map((partner) => (
                <Card key={partner.id} className="h-full rounded-3xl border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 flex items-center justify-center overflow-hidden text-primary-700 font-bold">
                        {partner.logo_url ? (
                          <img src={partner.logo_url} alt={partner.name} className="h-full w-full object-contain p-2" />
                        ) : (
                          partner.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 leading-6 break-words">{partner.name}</h3>
                        {partner.website && (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center text-sm text-primary-600 hover:underline"
                          >
                            {t('home.partnerWebsite')}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    {partner.description && (
                      <p className="text-sm text-gray-600 leading-6 line-clamp-3">{partner.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
              {fallbackPartners.map((name) => (
                <div key={name} className="rounded-2xl bg-white border border-gray-100 px-4 py-5 text-center text-lg font-bold text-gray-400 shadow-sm">
                  {name}
                </div>
              ))}
            </div>
          )}

          {!user && (
            <div className="text-center mt-12">
              <Link to="/login">
                <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
                  {t('home.Get Started')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
