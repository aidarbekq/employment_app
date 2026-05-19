import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import api from "@/services/api";

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
  name: "",
  slug: "",
  description: "",
  website: "",
  order: "100",
  is_active: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[«»"']/g, "")
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "partner";

const AdminPartnersPage: React.FC = () => {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [form, setForm] = useState<PartnerForm>(initialForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sortedPartners = useMemo(
    () => [...partners].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [partners]
  );

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("employers/partners/");
      setPartners(res.data as Partner[]);
    } catch (error) {
      console.error("Failed to load partners", error);
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const resetForm = () => {
    setForm(initialForm);
    setLogoFile(null);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isCheckbox = e.target instanceof HTMLInputElement && e.target.type === "checkbox";
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;
    setForm((prev) => {
      const next = {
        ...prev,
        [name]: isCheckbox ? checked : value,
      };
      if (name === "name" && !editingId) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("slug", form.slug);
    payload.append("description", form.description);
    payload.append("website", form.website);
    payload.append("order", form.order || "100");
    payload.append("is_active", String(form.is_active));
    if (logoFile) {
      payload.append("logo", logoFile);
    }
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`employers/partners/${editingId}/`, buildPayload());
      } else {
        await api.post("employers/partners/", buildPayload());
      }
      toast.success(t("common.success"));
      resetForm();
      await fetchPartners();
    } catch (error) {
      console.error("Failed to save partner", error);
      toast.error(t("common.error"));
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
      description: partner.description || "",
      website: partner.website || "",
      order: String(partner.order ?? 100),
      is_active: partner.is_active,
    });
  };

  const handleDelete = async (partner: Partner) => {
    if (!confirm(t("common.confirmDelete"))) return;
    try {
      await api.delete(`employers/partners/${partner.id}/`);
      toast.success(t("common.success"));
      await fetchPartners();
    } catch (error) {
      console.error("Failed to delete partner", error);
      toast.error(t("common.error"));
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-10 py-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{t("admin.partnersManagement")}</h1>
        <p className="text-sm text-gray-500">{t("admin.partnersManagementHint")}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? t("admin.editPartner") : t("admin.addPartner")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" label={t("admin.partnerName")} value={form.name} onChange={handleChange} required />
              <Input name="slug" label="Slug" value={form.slug} onChange={handleChange} required />
              <Input name="website" label={t("admin.partnerWebsite")} value={form.website} onChange={handleChange} placeholder="https://example.com" />
              <Input name="order" label={t("admin.partnerOrder")} value={form.order} onChange={handleChange} type="number" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.partnerDescription")}</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.partnerLogo")}</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  {logoFile ? logoFile.name : t("admin.chooseLogo")}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} className="h-4 w-4" />
                {t("admin.partnerActive")}
              </label>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="submit" disabled={saving} leftIcon={<Plus className="h-4 w-4" />}>
                  {editingId ? t("common.save") : t("admin.addPartner")}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {t("common.cancel")}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.partnersList")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500">{t("common.loading")}</p>
            ) : (
              <div className="space-y-4">
                {sortedPartners.map((partner) => (
                  <div key={partner.id} className="rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-14 w-14 shrink-0 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center overflow-hidden font-semibold text-primary-700">
                        {partner.logo_url ? <img src={partner.logo_url} alt={partner.name} className="h-full w-full object-contain p-2" /> : partner.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{partner.name}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${partner.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {partner.is_active ? t("admin.active") : t("admin.inactive")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{partner.description || t("common.notSpecified")}</p>
                        {partner.website && (
                          <a href={partner.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-primary-600 hover:underline">
                            <Link2 className="mr-1 h-3 w-3" />
                            {partner.website}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 md:justify-end">
                      <Button size="sm" variant="outline" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => handleEdit(partner)}>
                        {t("common.edit")}
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(partner)}>
                        {t("common.delete")}
                      </Button>
                    </div>
                  </div>
                ))}
                {!sortedPartners.length && <div className="text-center py-10 text-gray-500">{t("common.noResults")}</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPartnersPage;
