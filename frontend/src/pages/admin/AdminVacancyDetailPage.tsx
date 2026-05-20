import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, Calendar, ClipboardList, DollarSign, MapPin, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DetailItem from '@/components/common/DetailItem';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/common/Card';

interface Vacancy {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employer?: string | { id?: number; company_name?: string };
}

const getEmployerName = (employer: Vacancy['employer']) => {
  if (!employer) return '';
  if (typeof employer === 'string') return employer;
  return employer.company_name || '';
};

const AdminVacancyDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const res = await api.get(`vacancies/vacancies/${id}/`);
        setVacancy(res.data);
      } catch {
        toast.error(t('vacancy.errorLoad'));
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVacancy();
  }, [id, t]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`vacancies/vacancies/${id}/`);
      toast.success(t('vacancy.successDelete'));
      navigate('/admin/vacancies');
    } catch {
      toast.error(t('vacancy.errorDelete'));
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const employerName = useMemo(() => getEmployerName(vacancy?.employer), [vacancy?.employer]);

  if (loading) return <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>;
  if (!vacancy) return <p className="mt-10 text-center text-error-600">{t('vacancy.errorLoad')}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={vacancy.title || t('vacancy.details')}
        subtitle={employerName || t('common.notSpecified')}
        icon={<Briefcase className="h-6 w-6" />}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/admin/vacancies')}>
              {t('common.backToList')}
            </Button>
            <Button leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/admin/vacancies/${vacancy.id}/edit`)}>
              {t('common.edit')}
            </Button>
            <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setShowConfirm(true)}>
              {t('common.delete')}
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-primary-50 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                vacancy.is_active
                  ? 'rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700 ring-1 ring-success-100'
                  : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200'
              }
            >
              {vacancy.is_active ? t('vacancy.active') : t('vacancy.inactive')}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
              {new Date(vacancy.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <CardContent className="space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label={t('employer.company_name')} value={employerName} icon={<Briefcase className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('vacancy.location')} value={vacancy.location} icon={<MapPin className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('vacancy.salary')} value={vacancy.salary ? `$${vacancy.salary}` : ''} icon={<DollarSign className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('vacancy.createdAt')} value={new Date(vacancy.created_at).toLocaleDateString()} icon={<Calendar className="h-4 w-4" />} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DetailItem
              label={t('vacancy.description')}
              value={vacancy.description ? <p className="whitespace-pre-line">{vacancy.description}</p> : undefined}
              icon={<ClipboardList className="h-4 w-4" />}
              emptyText={t('common.notSpecified')}
              className="bg-white"
            />
            <DetailItem
              label={t('vacancy.requirements')}
              value={vacancy.requirements ? <p className="whitespace-pre-line">{vacancy.requirements}</p> : undefined}
              icon={<ClipboardList className="h-4 w-4" />}
              emptyText={t('common.notSpecified')}
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        title={t('common.confirmDelete')}
        description={t('vacancy.confirmDelete', { title: vacancy.title }) || t('common.deleteDescription')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        loading={deleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminVacancyDetailPage;
