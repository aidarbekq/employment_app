import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, GraduationCap, Save, UserPlus } from 'lucide-react';
import api from '@/services/api';
import Button from '@/components/common/Button';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { InputField, SelectField, SwitchField, TextareaField } from '@/components/common/FormControls';

interface AcademicGroup {
  id: number;
  name: string;
  graduation_year: number | null;
  direction_name: string;
  profile: string;
  study_form: 'FULL_TIME' | 'PART_TIME';
  degree_level: 'BACHELOR' | 'MASTER';
}

type EmploymentStatus =
  | 'EMPLOYED_SPECIALTY'
  | 'EMPLOYED_NOT_SPECIALTY'
  | 'SELF_EMPLOYED'
  | 'CONTINUING_EDUCATION'
  | 'UNEMPLOYED'
  | 'LOST_CONTACT';

interface GraduateCreateForm {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  academic_group_id: string;
  graduation_year: string;
  specialty: string;
  direction: string;
  profile: string;
  study_form: '' | 'FULL_TIME' | 'PART_TIME';
  degree_level: 'BACHELOR' | 'MASTER';
  is_surveyed: boolean;
  employment_status: EmploymentStatus;
  workplace: string;
  position: string;
  continuing_education_place: string;
  useful_subjects: string;
  self_study_topics: string;
}

const initialForm: GraduateCreateForm = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  password2: '',
  academic_group_id: '',
  graduation_year: '',
  specialty: '',
  direction: '',
  profile: '',
  study_form: '',
  degree_level: 'BACHELOR',
  is_surveyed: true,
  employment_status: 'UNEMPLOYED',
  workplace: '',
  position: '',
  continuing_education_place: '',
  useful_subjects: '',
  self_study_topics: '',
};

const AdminGraduateCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [form, setForm] = useState<GraduateCreateForm>(initialForm);
  const [saving, setSaving] = useState(false);

  const selectedGroup = useMemo(() => groups.find((group) => String(group.id) === form.academic_group_id), [groups, form.academic_group_id]);

  useEffect(() => {
    api
      .get('alumni/academic-groups/')
      .then((res) => setGroups(res.data as AcademicGroup[]))
      .catch((error) => {
        console.error('Failed to load academic groups', error);
        toast.error(t('common.error'));
      });
  }, [t]);

  const updateForm = <K extends keyof GraduateCreateForm>(field: K, value: GraduateCreateForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupChange = (value: string) => {
    setForm((prev) => {
      const next = { ...prev, academic_group_id: value };
      const group = groups.find((item) => String(item.id) === value);
      if (group) {
        next.graduation_year = group.graduation_year ? String(group.graduation_year) : prev.graduation_year;
        next.direction = group.direction_name;
        next.profile = group.profile;
        next.study_form = group.study_form;
        next.degree_level = group.degree_level;
        next.specialty = group.profile || prev.specialty;
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.password !== form.password2) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        academic_group_id: form.academic_group_id ? Number(form.academic_group_id) : null,
        graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
        password: form.password || undefined,
        study_form: form.study_form || null,
        workplace: form.workplace || null,
        position: form.position || null,
        continuing_education_place: form.continuing_education_place || null,
        useful_subjects: form.useful_subjects || null,
        self_study_topics: form.self_study_topics || null,
      };
      await api.post('alumni/alumni-profiles/', payload);
      toast.success(t('common.success'));
      navigate('/admin/graduates');
    } catch (error) {
      console.error('Failed to create graduate', error);
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.addGraduate')}
        subtitle={t('admin.addGraduateHint')}
        icon={<UserPlus className="h-6 w-6" />}
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/admin/graduates')}>
            {t('common.backToList')}
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.personalData')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField label={t('auth.firstName')} required value={form.first_name} onChange={(event) => updateForm('first_name', event.target.value)} />
                <InputField label={t('auth.lastName')} required value={form.last_name} onChange={(event) => updateForm('last_name', event.target.value)} />
                <InputField label={t('auth.username')} required value={form.username} onChange={(event) => updateForm('username', event.target.value)} />
                <InputField label={t('auth.email')} required type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} />
                <InputField label={t('auth.password')} required type="password" value={form.password} onChange={(event) => updateForm('password', event.target.value)} />
                <InputField label={t('auth.confirmPassword')} required type="password" value={form.password2} onChange={(event) => updateForm('password2', event.target.value)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.educationData')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField label={t('graduate.group')} value={form.academic_group_id} onChange={(event) => handleGroupChange(event.target.value)}>
                  <option value="">{t('common.notSpecified')}</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </SelectField>
                <InputField label={t('graduate.graduation_year')} type="number" value={form.graduation_year} onChange={(event) => updateForm('graduation_year', event.target.value)} />
                <InputField label={t('graduate.direction')} value={form.direction} onChange={(event) => updateForm('direction', event.target.value)} />
                <InputField label={t('graduate.profileName')} value={form.profile} onChange={(event) => updateForm('profile', event.target.value)} />
                <InputField label={t('graduate.specialty')} value={form.specialty} onChange={(event) => updateForm('specialty', event.target.value)} />
                <SelectField label={t('graduate.studyForm')} value={form.study_form} onChange={(event) => updateForm('study_form', event.target.value as GraduateCreateForm['study_form'])}>
                  <option value="">{t('common.notSpecified')}</option>
                  <option value="FULL_TIME">{t('graduate.fullTime')}</option>
                  <option value="PART_TIME">{t('graduate.partTime')}</option>
                </SelectField>
                <SelectField label={t('graduate.degreeLevel')} value={form.degree_level} onChange={(event) => updateForm('degree_level', event.target.value as GraduateCreateForm['degree_level'])}>
                  <option value="BACHELOR">{t('graduate.bachelor')}</option>
                  <option value="MASTER">{t('graduate.master')}</option>
                </SelectField>
                {selectedGroup && (
                  <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4 text-sm leading-6 text-primary-800 md:col-span-2">
                    <GraduationCap className="mr-2 inline h-4 w-4" />
                    {t('admin.groupAutofillHint', { group: selectedGroup.name })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.employmentData')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField label={t('graduate.employmentStatus')} value={form.employment_status} onChange={(event) => updateForm('employment_status', event.target.value as EmploymentStatus)}>
                  <option value="EMPLOYED_SPECIALTY">{t('graduate.employedSpecialty')}</option>
                  <option value="EMPLOYED_NOT_SPECIALTY">{t('graduate.employedNotSpecialty')}</option>
                  <option value="SELF_EMPLOYED">{t('graduate.selfEmployed')}</option>
                  <option value="CONTINUING_EDUCATION">{t('graduate.continuingEducation')}</option>
                  <option value="UNEMPLOYED">{t('graduate.unemployed')}</option>
                  <option value="LOST_CONTACT">{t('graduate.lostContact')}</option>
                </SelectField>
                <InputField label={t('graduate.workplace')} value={form.workplace} onChange={(event) => updateForm('workplace', event.target.value)} />
                <InputField label={t('graduate.position')} value={form.position} onChange={(event) => updateForm('position', event.target.value)} />
                <InputField label={t('graduate.continuingEducationPlace')} value={form.continuing_education_place} onChange={(event) => updateForm('continuing_education_place', event.target.value)} />
                <SwitchField label={t('graduate.isSurveyed')} description={t('graduate.surveyInfo')} checked={form.is_surveyed} onChange={(checked) => updateForm('is_surveyed', checked)} className="md:col-span-2" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('graduate.surveyInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TextareaField label={t('graduate.usefulSubjects')} value={form.useful_subjects} onChange={(event) => updateForm('useful_subjects', event.target.value)} rows={5} />
                <TextareaField label={t('graduate.selfStudyTopics')} value={form.self_study_topics} onChange={(event) => updateForm('self_study_topics', event.target.value)} rows={5} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-xl shadow-gray-950/10 backdrop-blur sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/graduates')}>
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

export default AdminGraduateCreatePage;
