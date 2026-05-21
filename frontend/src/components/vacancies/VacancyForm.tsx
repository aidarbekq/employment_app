import React from 'react';
import { Briefcase, Building2, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';
import { InputField, SelectField, SwitchField, TextareaField } from '@/components/common/FormControls';

export interface VacancyFormData {
  employer_id?: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  is_active?: boolean;
}

export interface EmployerOption {
  id: number;
  company_name?: string;
  is_verified?: boolean;
}

interface VacancyFormProps {
  data: VacancyFormData;
  onChange: (data: VacancyFormData) => void;
  onSubmit: (event: React.FormEvent) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  showStatus?: boolean;
  showEmployerSelect?: boolean;
  employers?: EmployerOption[];
  employersLoading?: boolean;
  onCancel?: () => void;
}

const VacancyForm: React.FC<VacancyFormProps> = ({
  data,
  onChange,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  showStatus = false,
  showEmployerSelect = false,
  employers = [],
  employersLoading = false,
  onCancel,
}) => {
  const { t } = useTranslation();

  const updateField = (field: keyof VacancyFormData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const hasSelectableEmployer = !showEmployerSelect || employers.some((employer) => employer.is_verified);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('vacancy.formTitle')}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">{t('vacancy.formHint')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {showEmployerSelect && (
            <SelectField
              label={t('vacancy.employer')}
              required
              value={data.employer_id || ''}
              onChange={(event) => updateField('employer_id', event.target.value)}
              helperText={t('vacancy.employerHint')}
              className="md:col-span-2"
              disabled={employersLoading}
            >
              <option value="">{employersLoading ? t('common.loading') : t('vacancy.chooseEmployer')}</option>
              {employers.map((employer) => (
                <option key={employer.id} value={employer.id} disabled={!employer.is_verified}>
                  {employer.company_name || `${t('employer.company')} #${employer.id}`}
                  {!employer.is_verified ? ` — ${t('employer.pendingVerification')}` : ''}
                </option>
              ))}
            </SelectField>
          )}

          <InputField
            label={t('vacancy.title')}
            required
            value={data.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder={t('vacancy.placeholderTitle')}
          />
          <InputField
            label={t('vacancy.location')}
            required
            value={data.location}
            onChange={(event) => updateField('location', event.target.value)}
            placeholder={t('vacancy.placeholderLocation')}
          />
          <InputField
            label={t('vacancy.salary')}
            type="number"
            value={data.salary}
            onChange={(event) => updateField('salary', event.target.value)}
            placeholder={t('vacancy.placeholderSalary')}
            helperText={t('vacancy.salaryHint')}
            className="md:col-span-2 lg:col-span-1"
          />
          {showStatus && (
            <SwitchField
              label={t('vacancy.active')}
              description={t('vacancy.activeHint')}
              checked={Boolean(data.is_active)}
              onChange={(checked) => updateField('is_active', checked)}
              className="md:col-span-2 lg:col-span-1"
            />
          )}
        </div>

        {showEmployerSelect && !hasSelectableEmployer && !employersLoading && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{t('vacancy.noVerifiedEmployersHint')}</p>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700 ring-1 ring-accent-100">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('vacancy.description')}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">{t('vacancy.descriptionHint')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <TextareaField
            label={t('vacancy.description')}
            required
            value={data.description}
            onChange={(event) => updateField('description', event.target.value)}
            rows={5}
            placeholder={t('vacancy.placeholderDescription')}
          />
          <TextareaField
            label={t('vacancy.requirements')}
            value={data.requirements}
            onChange={(event) => updateField('requirements', event.target.value)}
            rows={4}
            placeholder={t('vacancy.placeholderRequirements')}
          />
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-xl shadow-gray-950/10 backdrop-blur sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || !hasSelectableEmployer} className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default VacancyForm;
