import React, { useState } from 'react';
import { Handshake, Link2, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { useServerPaginatedList } from '@/hooks/useServerPaginatedList';
import { getPaginationRange } from '@/utils/pagination';
import { InputField, SwitchField, TextareaField } from '@/components/common/FormControls';

interface Partner {
  id: number;
  name: string;
  slug: string;
  description: string;
  website: string;
  logo_url: string | null;
  order: number;
  is_active: boolean;
}

interface PartnerForm {
  name: string;
  slug: string;
  description: string;
  website: string;
  order: string;
  is_active: boolean;
}

const initialForm: PartnerForm = {
  name: '',
  slug: '',
  description: '',
  website: '',
  order: '100',
  is_active: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[«»"']/g, '')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'partner';

const AdminPartnersPage: React.FC = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState<PartnerForm>(initialForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    items: partners,
    loading,
    meta,
    refetch: fetchPartners,
    setPage,
  } = useServerPaginatedList<Partner>('employers/partners/', {
    params: { ordering: 'order,name', include_inactive: 'true' },
    onError: () => toast.error(t('common.error')),
  });
  const { startIndex, endIndex } = getPaginationRange(meta);

  const resetForm = () => {
    setForm(initialForm);
    setLogoFile(null);
    setEditingId(null);
  };

  const updateField = <K extends keyof PartnerForm>(field: K, value: PartnerForm[K]) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !editingId) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('slug', form.slug);
    payload.append('description', form.description);
    payload.append('website', form.website);
    payload.append('order', form.order || '100');
    payload.append('is_active', String(form.is_active));
    if (logoFile) payload.append('logo', logoFile);
    return payload;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`employers/partners/${editingId}/`, buildPayload());
      } else {
        await api.post('employers/partners/', buildPayload());
      }
      toast.success(t('common.success'));
      resetForm();
      await fetchPartners();
    } catch (error) {
      console.error('Failed to save partner', error);
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingId(partner.id);
    setLogoFile(null);
    setForm({
      name: partner.name,
      slug: partner.slug,
      description: partner.description || '',
      website: partner.website || '',
      order: String(partner.order ?? 100),
      is_active: partner.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`employers/partners/${deleteTarget.id}/`);
      toast.success(t('common.success'));
      await fetchPartners();
      if (editingId === deleteTarget.id) resetForm();
    } catch (error) {
      console.error('Failed to delete partner', error);
      toast.error(t('common.error'));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.partnersManagement')}
        subtitle={t('admin.partnersManagementHint')}
        icon={<Handshake className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? t('admin.editPartner') : t('admin.addPartner')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField label={t('admin.partnerName')} required value={form.name} onChange={(event) => updateField('name', event.target.value)} />
              <InputField label="Slug" required value={form.slug} onChange={(event) => updateField('slug', event.target.value)} />
              <InputField label={t('admin.partnerWebsite')} value={form.website} onChange={(event) => updateField('website', event.target.value)} placeholder="https://example.com" />
              <InputField label={t('admin.partnerOrder')} type="number" value={form.order} onChange={(event) => updateField('order', event.target.value)} />
              <TextareaField label={t('admin.partnerDescription')} value={form.description} onChange={(event) => updateField('description', event.target.value)} rows={4} />
              <div>
                <p className="mb-1.5 text-sm font-semibold text-gray-700">{t('admin.partnerLogo')}</p>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 px-4 py-4 text-sm font-medium text-gray-600 transition hover:border-primary-300 hover:bg-primary-50">
                  <Upload className="h-4 w-4" />
                  {logoFile ? logoFile.name : t('admin.chooseLogo')}
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} />
                </label>
              </div>
              <SwitchField label={t('admin.partnerActive')} checked={form.is_active} onChange={(checked) => updateField('is_active', checked)} />
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button type="submit" isLoading={saving} leftIcon={<Plus className="h-4 w-4" />}>
                  {editingId ? t('common.save') : t('admin.addPartner')}
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
            <CardTitle>{t('admin.partnersList')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-gray-500">{t('common.loading')}</p>
            ) : partners.length ? (
              <>
              <div className="space-y-4">
                {partners.map((partner) => (
                  <article key={partner.id} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-md">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-accent-50 font-bold text-primary-700">
                          {partner.logo_url ? <img src={partner.logo_url} alt={partner.name} className="h-full w-full object-contain p-2" /> : partner.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-bold text-gray-900">{partner.name}</h3>
                            <span className={partner.is_active ? 'rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700 ring-1 ring-success-100' : 'rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200'}>
                              {partner.is_active ? t('admin.active') : t('admin.inactive')}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">{partner.description || t('common.notSpecified')}</p>
                          {partner.website && (
                            <a href={partner.website} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center text-sm font-medium text-primary-600 hover:underline">
                              <Link2 className="mr-1 h-3.5 w-3.5" />
                              {partner.website}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 md:justify-end">
                        <Button size="sm" variant="outline" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => handleEdit(partner)}>
                          {t('common.edit')}
                        </Button>
                        <Button size="sm" variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteTarget(partner)}>
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
              <EmptyState icon={<Handshake className="h-7 w-7" />} title={t('common.noResults')} description={t('common.emptyList')} />
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

export default AdminPartnersPage;