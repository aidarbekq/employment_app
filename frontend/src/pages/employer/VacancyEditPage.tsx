import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const VacancyEditPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VacancyFormData>(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const res = await api.get(`vacancies/vacancies/${id}/`);
        setFormData({
          title: res.data.title || '',
          description: res.data.description || '',
          requirements: res.data.requirements || '',
          location: res.data.location || '',
          salary: res.data.salary || '',
        });
      } catch (err) {
        console.error('Vacancy loading error:', err);
        toast.error(t('vacancy.errorLoad'));
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVacancy();
  }, [id, t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      await api.put(`vacancies/vacancies/${id}/`, formData);
      toast.success(t('vacancy.successUpdate'));
      navigate('/employer/vacancies');
    } catch (err) {
      console.error('Vacancy save error:', err);
      toast.error(t('vacancy.errorUpdate'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('vacancy.editHeading')}
        subtitle={t('vacancy.descriptionHint')}
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
        submitLabel={submitting ? t('vacancy.updating') : t('vacancy.updateVacancy')}
        isSubmitting={submitting}
        onCancel={() => navigate('/employer/vacancies')}
      />
    </div>
  );
};

export default VacancyEditPage;
