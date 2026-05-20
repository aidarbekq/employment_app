import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, KeyRound, Mail, MapPin, Pencil, Phone, Save, Trash2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DetailItem from '@/components/common/DetailItem';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/common/Card';
import { InputField, TextareaField } from '@/components/common/FormControls';

interface UserInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface Employer {
  id: number;
  user: UserInfo;
  company_name: string;
  address: string;
  phone: string;
  description: string;
}

const AdminEmployerDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchEmployer = async () => {
      try {
        const res = await api.get(`employers/employers/${id}/`);
        setEmployer(res.data);
      } catch {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchEmployer();
  }, [id, t]);

  const updateField = (field: keyof Pick<Employer, 'company_name' | 'address' | 'phone' | 'description'>, value: string) => {
    setEmployer((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleUpdate = async () => {
    if (!employer) return;
    setSaving(true);
    try {
      await api.put(`employers/employers/${employer.id}/`, {
        company_name: employer.company_name,
        address: employer.address,
        phone: employer.phone,
        description: employer.description,
      });
      toast.success(t('common.success'));
      setIsEditing(false);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!employer) return;
    setDeleting(true);
    try {
      await api.delete(`employers/employers/${employer.id}/`);
      toast.success(t('common.success'));
      navigate('/admin/employers');
    } catch {
      toast.error(t('common.error'));
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading) return <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>;
  if (error || !employer) return <p className="mt-10 text-center text-error-600">{error || t('common.error')}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={employer.company_name || t('admin.employersManagement')}
        subtitle={employer.user?.email || t('common.notSpecified')}
        icon={<Building2 className="h-6 w-6" />}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/admin/employers')}>
              {t('common.backToList')}
            </Button>
            <Button variant="outline" leftIcon={<KeyRound className="h-4 w-4" />} onClick={() => navigate(`/admin/users/${employer.user.id}/password`)}>
              {t('security.changePassword')}
            </Button>
            <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setShowConfirm(true)}>
              {t('common.delete')}
            </Button>
            {!isEditing ? (
              <Button leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setIsEditing(true)}>
                {t('common.edit')}
              </Button>
            ) : (
              <Button leftIcon={<Save className="h-4 w-4" />} isLoading={saving} onClick={handleUpdate}>
                {t('common.save')}
              </Button>
            )}
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-5 py-6 text-white sm:px-6">
          <p className="text-sm text-primary-100">{t('employer.company')}</p>
          <h2 className="mt-1 text-2xl font-bold">{employer.company_name || t('common.notSpecified')}</h2>
        </div>
        <CardContent className="space-y-6 p-5 sm:p-6">
          {!isEditing ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <DetailItem label={t('employer.company_name')} value={employer.company_name} icon={<Building2 className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
                <DetailItem label={t('employer.address')} value={employer.address} icon={<MapPin className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
                <DetailItem label={t('employer.phone')} value={employer.phone} icon={<Phone className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
                <DetailItem label={t('auth.firstName')} value={employer.user?.first_name} icon={<UserCircle className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
                <DetailItem label={t('auth.lastName')} value={employer.user?.last_name} icon={<UserCircle className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
                <DetailItem label={t('auth.email')} value={employer.user?.email} icon={<Mail className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
              </div>
              <DetailItem label={t('employer.description')} value={employer.description ? <p className="whitespace-pre-line">{employer.description}</p> : undefined} emptyText={t('common.notSpecified')} className="bg-white" />
            </>
          ) : (
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); handleUpdate(); }}>
              <InputField label={t('employer.company_name')} value={employer.company_name || ''} onChange={(event) => updateField('company_name', event.target.value)} />
              <InputField label={t('employer.address')} value={employer.address || ''} onChange={(event) => updateField('address', event.target.value)} />
              <InputField label={t('employer.phone')} value={employer.phone || ''} onChange={(event) => updateField('phone', event.target.value)} />
              <TextareaField className="md:col-span-2" label={t('employer.description')} rows={5} value={employer.description || ''} onChange={(event) => updateField('description', event.target.value)} />
              <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-xl shadow-gray-950/10 backdrop-blur sm:flex-row sm:justify-end md:col-span-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
                  {t('common.save')}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        title={t('common.confirmDelete')}
        description={t('admin.confirmDeleteEmployer', { name: employer.company_name })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        loading={deleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminEmployerDetailPage;
