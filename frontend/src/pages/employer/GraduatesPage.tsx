import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, Calendar, Eye, FileText, GraduationCap, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import EmploymentStatusBadge from '@/components/common/EmploymentStatusBadge';
import Pagination from '@/components/common/Pagination';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/common/Card';
import { fieldClass } from '@/components/common/FormControls';
import { useServerPaginatedList } from '@/hooks/useServerPaginatedList';
import { getListResults, getPaginationRange } from '@/utils/pagination';

interface AcademicGroup {
  id: number;
  name: string;
  graduation_year: number | null;
}

interface Graduate {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  academic_group?: AcademicGroup | null;
  graduation_year: number | null;
  specialty: string | null;
  profile?: string | null;
  employment_status?: string;
  employment_status_display?: string;
  is_employed: boolean;
  employer: number | null;
  position: string | null;
  workplace?: string | null;
  resume: string | null;
}

const EmployerGraduatesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('');

  useEffect(() => {
    api
      .get('alumni/academic-groups/', { params: { page_size: 100, ordering: '-graduation_year,name' } })
      .then((res) => setGroups(getListResults<AcademicGroup>(res.data)))
      .catch((err) => console.error('Error loading groups', err));
  }, []);

  const params = useMemo(
    () => ({
      search,
      graduation_year: yearFilter,
      is_employed: employmentFilter,
      ordering: 'user__last_name,user__first_name',
    }),
    [employmentFilter, search, yearFilter]
  );

  const {
    items: graduates,
    loading,
    meta,
    setPage,
  } = useServerPaginatedList<Graduate>('alumni/alumni-profiles/', {
    params,
    mapResults: (items) => items.filter((graduate) => graduate.user?.role === 'ALUMNI'),
  });
  const { startIndex, endIndex } = getPaginationRange(meta);

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    groups.forEach((group) => {
      if (group.graduation_year) years.add(String(group.graduation_year));
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [groups]);

  const statusLabel = (graduate: Graduate) => graduate.employment_status_display || (graduate.is_employed ? t('graduate.employed') : t('graduate.unemployed'));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.graduatesListTitle')}
        subtitle={t('admin.graduatesListHint')}
        icon={<GraduationCap className="h-6 w-6" />}
      />

      <Card className="overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px]">
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

            <select className={fieldClass} value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
              <option value="">{t('admin.yearFilter')}</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select className={fieldClass} value={employmentFilter} onChange={(event) => setEmploymentFilter(event.target.value)}>
              <option value="">{t('graduate.employmentStatus')}</option>
              <option value="true">{t('graduate.employed')}</option>
              <option value="false">{t('graduate.unemployed')}</option>
            </select>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">{t('common.loading')}</div>
          ) : graduates.length ? (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {graduates.map((graduate) => (
                  <article key={graduate.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-gray-900">
                            {graduate.user.first_name} {graduate.user.last_name}
                          </h3>
                          <p className="mt-1 truncate text-sm text-gray-500">
                            {graduate.academic_group?.name || t('common.notSpecified')} · {graduate.profile || graduate.specialty || t('common.notSpecified')}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" leftIcon={<Eye className="h-4 w-4" />} onClick={() => navigate(`/employer/graduates/${graduate.id}`)}>
                        {t('common.view')}
                      </Button>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 text-sm text-gray-700">
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1.5 ring-1 ring-gray-100">
                        <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                        {graduate.graduation_year || t('common.notSpecified')}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1.5 ring-1 ring-gray-100">
                        <Briefcase className="mr-1.5 h-4 w-4 text-gray-400" />
                        {graduate.position || graduate.workplace || t('common.notSpecified')}
                      </span>
                      <EmploymentStatusBadge status={graduate.employment_status} label={statusLabel(graduate)} />
                      {graduate.resume && (
                        <a href={graduate.resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 font-medium text-primary-700 ring-1 ring-primary-100 hover:bg-primary-100">
                          <FileText className="mr-1.5 h-4 w-4" />
                          {t('graduate.resume')}
                        </a>
                      )}
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
            <EmptyState icon={<GraduationCap className="h-7 w-7" />} title={t('common.noResults')} description={t('common.tryAdjustingFilters')} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerGraduatesPage;
