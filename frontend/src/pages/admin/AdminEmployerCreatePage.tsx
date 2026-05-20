import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, Save, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import Button from '@/components/common/Button';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { InputField, TextareaField } from '@/components/common/FormControls';
import api from '@/services/api';

type EmployerCreateForm = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  company_name: string;
  address: string;
  phone: string;
  description: string;
};

const initialForm: EmployerCreateForm = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  password2: '',
  company_name: '',
  address: '',
  phone: '',
  description: '',
};

const AdminEmployerCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState<EmployerCreateForm>(initialForm);
  const [saving, setSaving] = useState(false);

  const updateForm = <K extends keyof EmployerCreateForm>(field: K, value: EmployerCreateForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.password !== form.password2) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    setSaving(true);
    try {
      await api.post('employers/employers/', {
        ...form,
        address: form.address || null,
        phone: form.phone || null,
        description: form.description || null,
      });
      toast.success(t('common.success'));
      navigate('/admin/employers');
    } catch (error) {
      console.error('Failed to create employer', error);
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.addEmployer')}
        subtitle={t('admin.addEmployerHint')}
        icon={<UserPlus className="h-6 w-6" />}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/admin/employers')}>
            {t('common.backToList')}
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('employer.company')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField label={t('employer.company_name')} required value={form.company_name} onChange={(event) => updateForm('company_name', event.target.value)} className="md:col-span-2" />
                <InputField label={t('employer.address')} value={form.address} onChange={(event) => updateForm('address', event.target.value)} />
                <InputField label={t('employer.phone')} value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
                <TextareaField label={t('employer.description')} value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows={5} className="md:col-span-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.personalData')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField label={t('auth.firstName')} value={form.first_name} onChange={(event) => updateForm('first_name', event.target.value)} />
                <InputField label={t('auth.lastName')} value={form.last_name} onChange={(event) => updateForm('last_name', event.target.value)} />
                <InputField label={t('auth.username')} required value={form.username} onChange={(event) => updateForm('username', event.target.value)} />
                <InputField label={t('auth.email')} required type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} />
                <InputField label={t('security.newPassword')} required type="password" value={form.password} onChange={(event) => updateForm('password', event.target.value)} />
                <InputField label={t('security.confirmNewPassword')} required type="password" value={form.password2} onChange={(event) => updateForm('password2', event.target.value)} />
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-primary-50 to-white">
            <CardContent className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-700 ring-1 ring-primary-100">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">{t('admin.addEmployerSideTitle')}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{t('admin.addEmployerSideText')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-xl shadow-gray-950/10 backdrop-blur sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/employers')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminEmployerCreatePage;
