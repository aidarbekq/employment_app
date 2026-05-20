import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import Button from '@/components/common/Button';
import PageHeader from '@/components/common/PageHeader';
import VacancyForm, { VacancyFormData } from '@/components/vacancies/VacancyForm';

const initialForm: VacancyFormData = {
  title: '',
  description: '',
  requirements: '',
  location: '',
  salary: '',
};

const VacancyCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VacancyFormData>(initialForm);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post('vacancies/vacancies/', formData);
      toast.success(t('vacancy.successCreate'));
      navigate('/employer/vacancies');
    } catch (err: unknown) {
      console.error('Error creating vacancy:', err instanceof Error ? err.message : err);
      toast.error(t('vacancy.errorCreate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('vacancy.formHeading')}
        subtitle={t('vacancy.formHint')}
        icon={<Briefcase className="h-6 w-6" />}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/employer/vacancies')}>
            {t('vacancy.backToVacancies')}
          </Button>
        }
      />

      <VacancyForm
        data={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        submitLabel={loading ? t('vacancy.creating') : t('vacancy.createVacancy')}
        isSubmitting={loading}
        onCancel={() => navigate('/employer/vacancies')}
      />
    </div>
  );
};

export default VacancyCreatePage;
