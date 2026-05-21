import React, { useMemo, useState } from 'react';
import { Briefcase, Calendar, Pencil, Plus, Search, Trash2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import api from '@/services/api';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/common/Card';
import { fieldClass } from '@/components/common/FormControls';
import { useServerPaginatedList } from '@/hooks/useServerPaginatedList';
import { getPaginationRange } from '@/utils/pagination';

interface Vacancy {
  id: number;
  employer: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  is_active: boolean;
  created_at: string;
}

const VacanciesPage: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const params = useMemo(() => ({ search, ordering: '-created_at' }), [search]);
  const {
    items: vacancies,
    loading,
    meta,
    refetch,
    setPage,
  } = useServerPaginatedList<Vacancy>('vacancies/vacancies/', {
    params,
    onError: () => toast.error(t('vacancy.errorLoad')),
  });
  const { startIndex, endIndex } = getPaginationRange(meta);

  const confirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.delete(`vacancies/vacancies/${deleteId}/`);
      toast.success(t('vacancy.successDelete'));
      await refetch();
    } catch (err) {
      console.error('Error deleting vacancy', err);
      toast.error(t('vacancy.errorDelete'));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const selectedVacancy = vacancies.find((vacancy) => vacancy.id === deleteId);

  if (loading) return <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employer.vacancies')}
        subtitle={t('admin.vacanciesListHint')}
        icon={<Briefcase className="h-6 w-6" />}
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/employer/vacancies/create')}>
            {t('vacancy.addVacancy')}
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

          {vacancies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {vacancies.map((vacancy) => (
                  <article
                    key={vacancy.id}
                    className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                          <Briefcase className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-gray-900">{vacancy.title || t('common.notSpecified')}</h3>
                          <p className="mt-1 truncate text-sm text-gray-500">{vacancy.employer}</p>
                        </div>
                      </div>
                      <span
                        className={
                          vacancy.is_active
                            ? 'rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700 ring-1 ring-success-100'
                            : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200'
                        }
                      >
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

                    {vacancy.description && <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">{vacancy.description}</p>}

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Pencil className="h-4 w-4" />}
                        onClick={() => navigate(`/employer/vacancies/${vacancy.id}/edit`)}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={() => setDeleteId(vacancy.id)}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
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
            <EmptyState
              icon={<Briefcase className="h-7 w-7" />}
              title={t('vacancy.noResults')}
              description={t('common.tryAdjustingFilters')}
              actions={
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/employer/vacancies/create')}>
                  {t('vacancy.addVacancy')}
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        title={t('common.confirmDelete')}
        description={selectedVacancy ? t('vacancy.confirmDelete', { title: selectedVacancy.title }) : t('common.deleteDescription')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        loading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default VacanciesPage;
