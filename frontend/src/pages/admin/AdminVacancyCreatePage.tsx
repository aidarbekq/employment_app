import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import Button from '@/components/common/Button';
import PageHeader from '@/components/common/PageHeader';
import VacancyForm, { EmployerOption, VacancyFormData } from '@/components/vacancies/VacancyForm';
import { getListResults } from '@/utils/pagination';

const initialForm: VacancyFormData = {
  employer_id: '',
  title: '',
  description: '',
  requirements: '',
  location: '',
  salary: '',
  is_active: true,
};

const AdminVacancyCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VacancyFormData>(initialForm);
  const [employers, setEmployers] = useState<EmployerOption[]>([]);
  const [employersLoading, setEmployersLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const response = await api.get('employers/employers/', {
          params: { page_size: 100, ordering: 'company_name' },
        });
        setEmployers(getListResults<EmployerOption>(response.data));
      } catch {
        toast.error(t('employer.loadError'));
      } finally {
        setEmployersLoading(false);
      }
    };

    fetchEmployers();
  }, [t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post('vacancies/vacancies/', {
        ...formData,
        salary: formData.salary || null,
      });
      toast.success(t('vacancy.successCreate'));
      navigate('/admin/vacancies');
    } catch {
      toast.error(t('vacancy.errorCreate'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('vacancy.adminCreateHeading')}
        subtitle={t('vacancy.adminCreateHint')}
        icon={<Briefcase className="h-6 w-6" />}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/admin/vacancies')}>
            {t('vacancy.backToVacancies')}
          </Button>
        }
      />

      <VacancyForm
        data={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        submitLabel={submitting ? t('vacancy.creating') : t('vacancy.createVacancy')}
        isSubmitting={submitting}
        showStatus
        showEmployerSelect
        employers={employers}
        employersLoading={employersLoading}
        onCancel={() => navigate('/admin/vacancies')}
      />
    </div>
  );
};

export default AdminVacancyCreatePage;
