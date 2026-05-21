import React, { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Edit, Layers, Plus, Trash2 } from 'lucide-react';
import api from '@/services/api';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { useServerPaginatedList } from '@/hooks/useServerPaginatedList';
import { getPaginationRange } from '@/utils/pagination';
import { InputField, SelectField, SwitchField } from '@/components/common/FormControls';

interface AcademicGroup {
  id: number;
  name: string;
  graduation_year: number | null;
  direction_code: string;
  direction_name: string;
  profile: string;
  study_form: string;
  study_form_display?: string;
  degree_level: string;
  degree_level_display?: string;
  is_active: boolean;
}

type GroupFormData = {
  name: string;
  graduation_year: string;
  direction_code: string;
  direction_name: string;
  profile: string;
  study_form: string;
  degree_level: string;
  is_active: boolean;
};

const emptyForm: GroupFormData = {
  name: '',
  graduation_year: '',
  direction_code: '710200',
  direction_name: 'Информационные системы и технологии',
  profile: '',
  study_form: 'FULL_TIME',
  degree_level: 'BACHELOR',
  is_active: true,
};

const toFormData = (group: AcademicGroup): GroupFormData => ({
  name: group.name,
  graduation_year: group.graduation_year ? String(group.graduation_year) : '',
  direction_code: group.direction_code || '',
  direction_name: group.direction_name || '',
  profile: group.profile || '',
  study_form: group.study_form || 'FULL_TIME',
  degree_level: group.degree_level || 'BACHELOR',
  is_active: group.is_active,
});

const toPayload = (form: GroupFormData) => ({
  name: form.name.trim(),
  graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
  direction_code: form.direction_code.trim(),
  direction_name: form.direction_name.trim(),
  profile: form.profile.trim(),
  study_form: form.study_form,
  degree_level: form.degree_level,
  is_active: form.is_active,
});

const AdminGroupsPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<GroupFormData>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AcademicGroup | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    items: groups,
    loading,
    meta,
    refetch: loadGroups,
    setPage,
  } = useServerPaginatedList<AcademicGroup>('alumni/academic-groups/', {
    params: { ordering: '-graduation_year,name' },
    onError: () => toast.error(t('common.error')),
  });
  const { startIndex, endIndex } = getPaginationRange(meta);

  const updateField = <K extends keyof GroupFormData>(field: K, value: GroupFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`alumni/academic-groups/${editingId}/`, toPayload(formData));
      } else {
        await api.post('alumni/academic-groups/', toPayload(formData));
      }
      toast.success(t('common.success'));
      resetForm();
      await loadGroups();
    } catch (error) {
      console.error('Error saving academic group', error);
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (group: AcademicGroup) => {
    setEditingId(group.id);
    setFormData(toFormData(group));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`alumni/academic-groups/${deleteTarget.id}/`);
      toast.success(t('common.success'));
      await loadGroups();
      if (editingId === deleteTarget.id) resetForm();
    } catch (error) {
      console.error('Error deleting academic group', error);
      toast.error(t('common.error'));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.groupsManagement')}
        subtitle={t('admin.groupsManagementHint')}
        icon={<Layers className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? t('admin.editGroup') : t('admin.addGroup')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField label={t('admin.groupName')} required value={formData.name} onChange={(event) => updateField('name', event.target.value)} placeholder="ИСТТ-1-21" />
              <InputField label={t('admin.year')} type="number" value={formData.graduation_year} onChange={(event) => updateField('graduation_year', event.target.value)} placeholder="2026" />
              <InputField label={t('admin.directionCode')} value={formData.direction_code} onChange={(event) => updateField('direction_code', event.target.value)} placeholder="710200" />
              <InputField label={t('admin.directionName')} value={formData.direction_name} onChange={(event) => updateField('direction_name', event.target.value)} />
              <InputField label={t('graduate.profileName')} value={formData.profile} onChange={(event) => updateField('profile', event.target.value)} className="md:col-span-2" />
              <SelectField label={t('graduate.studyForm')} value={formData.study_form} onChange={(event) => updateField('study_form', event.target.value)}>
                <option value="FULL_TIME">{t('graduate.fullTime')}</option>
                <option value="PART_TIME">{t('graduate.partTime')}</option>
              </SelectField>
              <SelectField label={t('graduate.degreeLevel')} value={formData.degree_level} onChange={(event) => updateField('degree_level', event.target.value)}>
                <option value="BACHELOR">{t('graduate.bachelor')}</option>
                <option value="MASTER">{t('graduate.master')}</option>
              </SelectField>
              <SwitchField label={t('admin.groupActive')} checked={formData.is_active} onChange={(checked) => updateField('is_active', checked)} className="md:col-span-2" />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row md:col-span-2">
                <Button type="submit" leftIcon={<Plus className="h-4 w-4" />} isLoading={saving}>
                  {editingId ? t('common.save') : t('admin.addGroup')}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {t('common.cancel')}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.groupsList')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-gray-500">{t('common.loading')}</p>
            ) : groups.length ? (
              <>
              <div className="space-y-3">
                {groups.map((group) => (
                  <article key={group.id} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-md">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
                          <span className={group.is_active ? 'rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700 ring-1 ring-success-100' : 'rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200'}>
                            {group.is_active ? t('admin.active') : t('admin.inactive')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          {group.direction_code} · {group.profile || group.direction_name}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-gray-600">
                          <span className="rounded-full bg-gray-50 px-2.5 py-1 ring-1 ring-gray-100">{group.graduation_year || t('common.notSpecified')}</span>
                          <span className="rounded-full bg-gray-50 px-2.5 py-1 ring-1 ring-gray-100">{group.study_form_display || group.study_form}</span>
                          <span className="rounded-full bg-gray-50 px-2.5 py-1 ring-1 ring-gray-100">{group.degree_level_display || group.degree_level}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:justify-end">
                        <Button size="sm" variant="outline" leftIcon={<Edit className="h-4 w-4" />} onClick={() => handleEdit(group)}>
                          {t('common.edit')}
                        </Button>
                        <Button size="sm" variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteTarget(group)}>
                          {t('common.delete')}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <Pagination
                currentPage={meta.page}
                endIndex={endIndex}
                onPageChange={setPage}
                pageSize={meta.pageSize}
                startIndex={startIndex}
                totalItems={meta.count}
                totalPages={meta.totalPages}
              />
              </>
            ) : (
              <EmptyState icon={<Layers className="h-7 w-7" />} title={t('admin.noGroups')} description={t('common.noResults')} />
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('common.confirmDelete')}
        description={deleteTarget ? `${deleteTarget.name}. ${t('common.deleteDescription')}` : t('common.deleteDescription')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminGroupsPage;
