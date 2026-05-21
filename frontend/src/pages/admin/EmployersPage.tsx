import React, { useMemo, useState } from 'react';
import { Building2, Eye, MapPin, Phone, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/common/Card';
import { fieldClass } from '@/components/common/FormControls';
import { useServerPaginatedList } from '@/hooks/useServerPaginatedList';
import { getPaginationRange } from '@/utils/pagination';

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
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const params = useMemo(() => ({ search, ordering: 'company_name' }), [search]);
  const { items: employers, loading, meta, setPage } = useServerPaginatedList<Employer>('employers/employers/', { params });
  const { startIndex, endIndex } = getPaginationRange(meta);

  if (loading) return <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>;

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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={`${fieldClass} pl-10`}
              />
            </div>
          </div>

          {employers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {employers.map((employer) => (
                  <article
                    key={employer.id}
                    className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700 ring-1 ring-accent-100">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-gray-900">
                            {employer.company_name || t('common.notSpecified')}
                          </h3>
                          <p className="mt-1 truncate text-sm text-gray-500">{employer.user?.email || t('common.notSpecified')}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye className="h-4 w-4" />}
                        onClick={() => navigate(`/admin/employers/${employer.id}`)}
                      >
                        {t('common.view')}
                      </Button>
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

                    {employer.description && <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">{employer.description}</p>}
                  </article>
                ))}
              </div>
              <Pagination
                currentPage={meta.page}
                endIndex={endIndex}
                onPageChange={setPage}
                pageSize={meta.pageSize}
                startIndex={startIndex}
                totalItems={meta.count}
                totalPages={meta.totalPages}
              />
            </>
          ) : (
            <EmptyState icon={<Building2 className="h-7 w-7" />} title={t('common.noResults')} description={t('common.tryAdjustingFilters')} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployersPage;