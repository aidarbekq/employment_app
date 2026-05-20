import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, GraduationCap, KeyRound, Save, Trash2, UserRound } from 'lucide-react';
import api from '@/services/api';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
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

interface Graduate {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  academic_group: AcademicGroup | null;
  graduation_year: number | null;
  specialty: string | null;
  direction: string | null;
  profile: string | null;
  study_form: 'FULL_TIME' | 'PART_TIME' | null;
  degree_level: 'BACHELOR' | 'MASTER';
  is_surveyed: boolean;
  employment_status: string;
  employment_status_display?: string;
  employer: number | null;
  workplace: string | null;
  position: string | null;
  continuing_education_place: string | null;
  useful_subjects: string | null;
  self_study_topics: string | null;
  resume: string | null;
}

interface GraduateForm {
  academic_group_id: string;
  specialty: string;
  graduation_year: string;
  direction: string;
  profile: string;
  study_form: '' | 'FULL_TIME' | 'PART_TIME';
  degree_level: 'BACHELOR' | 'MASTER';
  is_surveyed: boolean;
  employment_status: string;
  workplace: string;
  position: string;
  employer: string;
  continuing_education_place: string;
  useful_subjects: string;
  self_study_topics: string;
  first_name: string;
  last_name: string;
  email: string;
}

const emptyForm: GraduateForm = {
  academic_group_id: '',
  specialty: '',
  graduation_year: '',
  direction: '',
  profile: '',
  study_form: '',
  degree_level: 'BACHELOR',
  is_surveyed: true,
  employment_status: 'UNEMPLOYED',
  workplace: '',
  position: '',
  employer: '',
  continuing_education_place: '',
  useful_subjects: '',
  self_study_topics: '',
  first_name: '',
  last_name: '',
  email: '',
};

const AdminGraduateDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [graduate, setGraduate] = useState<Graduate | null>(null);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [form, setForm] = useState<GraduateForm>(emptyForm);

  const selectedGroup = useMemo(() => groups.find((group) => String(group.id) === form.academic_group_id), [groups, form.academic_group_id]);

  useEffect(() => {
    Promise.all([api.get(`alumni/alumni-profiles/${id}/`), api.get('alumni/academic-groups/')])
      .then(([graduateResponse, groupResponse]) => {
        const data = graduateResponse.data as Graduate;
        setGraduate(data);
        setGroups(groupResponse.data as AcademicGroup[]);
        setForm({
          academic_group_id: data.academic_group ? String(data.academic_group.id) : '',
          specialty: data.specialty ?? '',
          graduation_year: data.graduation_year?.toString() ?? '',
          direction: data.direction ?? '',
          profile: data.profile ?? '',
          study_form: data.study_form ?? '',
          degree_level: data.degree_level ?? 'BACHELOR',
          is_surveyed: data.is_surveyed ?? true,
          employment_status: data.employment_status ?? 'UNEMPLOYED',
          workplace: data.workplace ?? '',
          position: data.position ?? '',
          employer: data.employer?.toString() ?? '',
          continuing_education_place: data.continuing_education_place ?? '',
          useful_subjects: data.useful_subjects ?? '',
          self_study_topics: data.self_study_topics ?? '',
          first_name: data.user.first_name ?? '',
          last_name: data.user.last_name ?? '',
          email: data.user.email ?? '',
        });
      })
      .catch((err) => {
        console.error('Load error:', err);
        toast.error(t('common.error'));
      })
      .finally(() => setLoading(false));
  }, [id, t]);

  const updateForm = <K extends keyof GraduateForm>(field: K, value: GraduateForm[K]) => {
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

  const handleUpdate = async () => {
    try {
      if (!graduate) return;
      setSaving(true);
      await api.patch(`users/user/${graduate.user.id}/`, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
      });
      await api.patch(`alumni/alumni-profiles/${id}/`, {
        academic_group_id: form.academic_group_id ? Number(form.academic_group_id) : null,
        specialty: form.specialty || null,
        graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
        direction: form.direction || null,
        profile: form.profile || null,
        study_form: form.study_form || null,
        degree_level: form.degree_level,
        is_surveyed: form.is_surveyed,
        employment_status: form.employment_status,
        workplace: form.workplace || null,
        position: form.position || null,
        employer: form.employer || null,
        continuing_education_place: form.continuing_education_place || null,
        useful_subjects: form.useful_subjects || null,
        self_study_topics: form.self_study_topics || null,
      });
      toast.success(t('common.success'));
      navigate('/admin/graduates');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`alumni/alumni-profiles/${id}/`);
      toast.success(t('common.success'));
      navigate('/admin/graduates');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('common.error'));
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading || !graduate) return <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>;

  const fullName = `${form.first_name} ${form.last_name}`.trim();

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName || t('graduate.updateProfile')}
        subtitle={graduate.employment_status_display || form.employment_status}
        icon={<UserRound className="h-6 w-6" />}
        actions={
          <>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/admin/graduates')}>
              {t('common.backToList')}
            </Button>
            <Button variant="outline" leftIcon={<KeyRound className="h-4 w-4" />} onClick={() => navigate(`/admin/users/${graduate.user.id}/password`)}>
              {t('security.changePassword')}
            </Button>
            <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setShowDeleteDialog(true)}>
              {t('common.delete')}
            </Button>
            <Button leftIcon={<Save className="h-4 w-4" />} isLoading={saving} onClick={handleUpdate}>
              {t('common.save')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.personalData')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField label={t('auth.firstName')} value={form.first_name} onChange={(event) => updateForm('first_name', event.target.value)} />
              <InputField label={t('auth.lastName')} value={form.last_name} onChange={(event) => updateForm('last_name', event.target.value)} />
              <InputField label={t('auth.email')} type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} className="md:col-span-2" />
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
              <SelectField label={t('graduate.studyForm')} value={form.study_form} onChange={(event) => updateForm('study_form', event.target.value as GraduateForm['study_form'])}>
                <option value="">{t('common.notSpecified')}</option>
                <option value="FULL_TIME">{t('graduate.fullTime')}</option>
                <option value="PART_TIME">{t('graduate.partTime')}</option>
              </SelectField>
              <SelectField label={t('graduate.degreeLevel')} value={form.degree_level} onChange={(event) => updateForm('degree_level', event.target.value as GraduateForm['degree_level'])}>
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
              <SelectField label={t('graduate.employmentStatus')} value={form.employment_status} onChange={(event) => updateForm('employment_status', event.target.value)}>
                <option value="EMPLOYED_SPECIALTY">{t('graduate.employedSpecialty')}</option>
                <option value="EMPLOYED_NOT_SPECIALTY">{t('graduate.employedNotSpecialty')}</option>
                <option value="SELF_EMPLOYED">{t('graduate.selfEmployed')}</option>
                <option value="CONTINUING_EDUCATION">{t('graduate.continuingEducation')}</option>
                <option value="UNEMPLOYED">{t('graduate.unemployed')}</option>
                <option value="LOST_CONTACT">{t('graduate.lostContact')}</option>
              </SelectField>
              <InputField label={t('graduate.workplace')} value={form.workplace} onChange={(event) => updateForm('workplace', event.target.value)} />
              <InputField label={t('graduate.position')} value={form.position} onChange={(event) => updateForm('position', event.target.value)} />
              <InputField label={t('admin.employerId')} value={form.employer} onChange={(event) => updateForm('employer', event.target.value)} />
              <InputField label={t('graduate.continuingEducationPlace')} value={form.continuing_education_place} onChange={(event) => updateForm('continuing_education_place', event.target.value)} className="md:col-span-2" />
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
              {graduate.resume && (
                <a href={graduate.resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 ring-1 ring-primary-100 hover:bg-primary-100">
                  {t('graduate.resume')}
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title={t('common.confirmDelete')}
        description={t('graduate.confirmDelete') || t('common.deleteDescription')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        loading={deleting}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminGraduateDetailPage;
