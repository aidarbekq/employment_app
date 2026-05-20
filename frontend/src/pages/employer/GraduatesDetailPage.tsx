import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BadgeCheck, Briefcase, Calendar, FileText, GraduationCap, Mail, User, XCircle } from 'lucide-react';
import api from '@/services/api';
import Button from '@/components/common/Button';
import DetailItem from '@/components/common/DetailItem';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/common/Card';

interface AcademicGroup {
  id: number;
  name: string;
}

interface GraduateDetail {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  academic_group?: AcademicGroup | null;
  specialty: string | null;
  direction?: string | null;
  profile?: string | null;
  study_form_display?: string | null;
  degree_level_display?: string | null;
  graduation_year: number | null;
  position: string | null;
  workplace?: string | null;
  employer: number | null;
  is_employed: boolean;
  employment_status_display?: string;
  continuing_education_place?: string | null;
  useful_subjects?: string | null;
  self_study_topics?: string | null;
  resume: string | null;
}

const EmployerGraduateDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [graduate, setGraduate] = useState<GraduateDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`alumni/alumni-profiles/${id}/`)
      .then((res) => setGraduate(res.data))
      .catch((err) => console.error('Load error:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>;
  if (!graduate) return <p className="mt-10 text-center text-error-600">{t('common.error')}</p>;

  const fullName = `${graduate.user.first_name} ${graduate.user.last_name}`.trim();
  const statusText = graduate.employment_status_display || (graduate.is_employed ? t('graduate.employed') : t('graduate.unemployed'));

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName || t('graduate.profile')}
        subtitle={graduate.academic_group?.name || graduate.profile || graduate.specialty || t('common.notSpecified')}
        icon={<GraduationCap className="h-6 w-6" />}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/employer/graduates')}>
            {t('common.backToList')}
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-5 py-6 text-white sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-primary-100">{t('graduate.employmentStatus')}</p>
              <h2 className="mt-1 text-2xl font-bold">{statusText}</h2>
            </div>
            <span className={graduate.is_employed ? 'inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20' : 'inline-flex items-center rounded-full bg-warning-300/20 px-3 py-1 text-sm font-semibold text-warning-50 ring-1 ring-warning-200/30'}>
              {graduate.is_employed ? <BadgeCheck className="mr-1.5 h-4 w-4" /> : <XCircle className="mr-1.5 h-4 w-4" />}
              {statusText}
            </span>
          </div>
        </div>
        <CardContent className="space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DetailItem label={t('auth.firstName')} value={graduate.user.first_name} icon={<User className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('auth.lastName')} value={graduate.user.last_name} icon={<User className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('auth.email')} value={graduate.user.email} icon={<Mail className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('graduate.group')} value={graduate.academic_group?.name} icon={<GraduationCap className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('graduate.graduation_year')} value={graduate.graduation_year} icon={<Calendar className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('graduate.position')} value={graduate.position || graduate.workplace} icon={<Briefcase className="h-4 w-4" />} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('graduate.direction')} value={graduate.direction} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('graduate.profile')} value={graduate.profile || graduate.specialty} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('graduate.studyForm')} value={graduate.study_form_display} emptyText={t('common.notSpecified')} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DetailItem label={t('graduate.continuingEducationPlace')} value={graduate.continuing_education_place} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('graduate.usefulSubjects')} value={graduate.useful_subjects ? <p className="whitespace-pre-line">{graduate.useful_subjects}</p> : undefined} emptyText={t('common.notSpecified')} />
            <DetailItem label={t('graduate.selfStudyTopics')} value={graduate.self_study_topics ? <p className="whitespace-pre-line">{graduate.self_study_topics}</p> : undefined} emptyText={t('common.notSpecified')} />
            <DetailItem
              label={t('graduate.resume')}
              value={
                graduate.resume ? (
                  <a href={graduate.resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary-700 hover:underline">
                    <FileText className="mr-2 h-4 w-4" />
                    {t('graduate.resume')}
                  </a>
                ) : null
              }
              emptyText={t('common.notSpecified')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerGraduateDetailPage;
