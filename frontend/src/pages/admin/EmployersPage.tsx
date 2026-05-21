import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Eye, MapPin, Phone, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/common/Card';
import { fieldClass } from '@/components/common/FormControls';
import { usePaginatedList } from '@/hooks/usePaginatedList';

interface Employer {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  company_name: string;
  address: string;
  phone: string;
  description: string | null;
}

const EmployersPage: React.FC = () => {
  const { t } = useTranslation();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const res = await api.get('employers/employers/');
        setEmployers(res.data);
      } catch (error) {
        console.error('Error loading employers', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployers();
  }, []);

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return employers.filter((employer) =>
      [employer.company_name, employer.address, employer.phone, employer.description, employer.user?.email]
        .some((field) => field?.toLowerCase().includes(lower))
    );
  }, [employers, search]);

  const {
    currentPage,
    endIndex,
    pageSize,
    paginatedItems: paginatedEmployers,
    setCurrentPage,
    startIndex,
    totalItems,
    totalPages,
  } = usePaginatedList(filtered, 10, search);

  if (loading) return <p className="mt-10 text-center text-gray-500">{t('admin.loadingEmployers')}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.employersListTitle')}
        subtitle={t('admin.employersListHint')}
        icon={<Building2 className="h-6 w-6" />}
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/admin/employers/create')}>
            {t('admin.addEmployer')}
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search')}
                className={`${fieldClass} pl-10`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {filtered.length > 0 ? (
            <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {paginatedEmployers.map((employer) => {
                const initials = (employer.company_name || employer.user?.email || '—').slice(0, 2).toUpperCase();
                return (
                  <article
                    key={employer.id}
                    className="group rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 text-lg font-bold text-primary-700 ring-1 ring-primary-100">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-bold text-gray-900">{employer.company_name || t('common.notSpecified')}</h3>
                        <p className="mt-1 truncate text-sm text-gray-500">{employer.user?.email || t('common.notSpecified')}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2">
                      <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{employer.address || t('common.notSpecified')}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{employer.phone || t('common.notSpecified')}</span>
                      </div>
                    </div>

                    {employer.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">{employer.description}</p>
                    )}

                    <div className="mt-5 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye className="h-4 w-4" />}
                        onClick={() => navigate(`/admin/employers/${employer.id}`)}
                      >
                        {t('common.view')}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
            <Pagination
              currentPage={currentPage}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              startIndex={startIndex}
              totalItems={totalItems}
              totalPages={totalPages}
            />
            </>
          ) : (
            <EmptyState
              icon={<Building2 className="h-7 w-7" />}
              title={t('common.noResults')}
              description={t('common.tryAdjustingFilters')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployersPage;
