import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import Button from '@/components/common/Button';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import api from '@/services/api';

const passwordInputClass =
  'block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-12 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const PasswordField = ({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
          className={passwordInputClass}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-2.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
};

const ChangePasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== newPassword2) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    setSaving(true);
    try {
      await api.post('users/password/change/', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      });
      toast.success(t('security.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setNewPassword2('');
    } catch (error) {
      console.error('Password change error', error);
      toast.error(t('security.passwordChangeError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={t('security.title')}
        subtitle={t('security.subtitle')}
        icon={<KeyRound className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>{t('security.changePassword')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordField
                label={t('security.currentPassword')}
                value={currentPassword}
                onChange={setCurrentPassword}
                autoComplete="current-password"
              />
              <PasswordField
                label={t('security.newPassword')}
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />
              <PasswordField
                label={t('security.confirmNewPassword')}
                value={newPassword2}
                onChange={setNewPassword2}
                autoComplete="new-password"
              />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
                  {t('common.cancel')}
                </Button>
                <Button type="submit" isLoading={saving} className="w-full sm:w-auto">
                  {t('security.savePassword')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="space-y-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-700 ring-1 ring-primary-100">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('security.recommendationsTitle')}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{t('security.recommendationsText')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
