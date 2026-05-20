import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, CheckCircle, Eye, MapPin, Search, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/common/Card';
import { fieldClass } from '@/components/common/FormControls';

type ActiveFilter = '' | 'true' | 'false';
type CreatedSort = '' | 'asc' | 'desc';

interface Vacancy {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: string;
  is_active: boolean;
  created_at: string;
  employer?: string | { id?: number; company_name?: string };
}

const getEmployerName = (employer: Vacancy['employer']) => {
  if (!employer) return '';
  if (typeof employer === 'string') return employer;
  return employer.company_name || '';
};

const AdminVacanciesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<ActiveFilter>('');
  const [createdSort, setCreatedSort] = useState<CreatedSort>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const res = await api.get('vacancies/vacancies/');
        setVacancies(res.data);
      } catch (err) {
        console.error('Error loading vacancies', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVacancies();
  }, []);

  const sorted = useMemo(() => {
    const filtered = vacancies.filter((vacancy) => {
      const query = search.toLowerCase();
      const employerName = getEmployerName(vacancy.employer);
      const matchesSearch = [vacancy.title, vacancy.location, employerName, vacancy.description].some((field) =>
        field?.toLowerCase().includes(query)
      );
      const matchesActive = isActiveFilter === '' || String(vacancy.is_active) === isActiveFilter;
      return matchesSearch && matchesActive;
    });

    return filtered.sort((a, b) => {
      if (createdSort === 'asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (createdSort === 'desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });
  }, [createdSort, isActiveFilter, search, vacancies]);

  if (loading) return <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.vacancies')}
        subtitle={t('admin.vacanciesListHint')}
        icon={<Briefcase className="h-6 w-6" />}
      />

      <Card className="overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={`${fieldClass} pl-10`}
              />
            </div>

            <select
              className={fieldClass}
              value={isActiveFilter}
              onChange={(event) => setIsActiveFilter(event.target.value as ActiveFilter)}
            >
              <option value="">{t('common.all')}</option>
              <option value="true">{t('vacancy.active')}</option>
              <option value="false">{t('vacancy.inactive')}</option>
            </select>

            <select
              className={fieldClass}
              value={createdSort}
              onChange={(event) => setCreatedSort(event.target.value as CreatedSort)}
            >
              <option value="desc">{t('common.newestFirst')}</option>
              <option value="asc">{t('common.oldestFirst')}</option>
            </select>
          </div>

          {sorted.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {sorted.map((vacancy) => {
                const employerName = getEmployerName(vacancy.employer);
                return (
                  <article
                    key={vacancy.id}
                    className="group rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                          <Briefcase className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-gray-900">{vacancy.title || t('common.notSpecified')}</h3>
                          <p className="mt-1 truncate text-sm text-gray-500">{employerName || t('common.notSpecified')}</p>
                        </div>
                      </div>
                      <span
                        className={
                          vacancy.is_active
                            ? 'inline-flex items-center rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700 ring-1 ring-success-100'
                            : 'inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200'
                        }
                      >
                        {vacancy.is_active ? <CheckCircle className="mr-1 h-3.5 w-3.5" /> : <XCircle className="mr-1 h-3.5 w-3.5" />}
                        {vacancy.is_active ? t('vacancy.active') : t('vacancy.inactive')}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2">
                      <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{vacancy.location || t('common.notSpecified')}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(vacancy.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {vacancy.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">{vacancy.description}</p>
                    )}

                    <div className="mt-5 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye className="h-4 w-4" />}
                        onClick={() => navigate(`/admin/vacancies/${vacancy.id}`)}
                      >
                        {t('common.view')}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Briefcase className="h-7 w-7" />}
              title={t('vacancy.noResults') || t('common.noResults')}
              description={t('common.tryAdjustingFilters')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVacanciesPage;
