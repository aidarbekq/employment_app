import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Edit, Layers, Plus, Trash2 } from "lucide-react";
import api from "@/services/api";
import Button from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";

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
  total_graduates: number | null;
  admission_count: number | null;
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
  total_graduates: string;
  admission_count: string;
  is_active: boolean;
};

const emptyForm: GroupFormData = {
  name: "",
  graduation_year: "",
  direction_code: "710200",
  direction_name: "Информационные системы и технологии",
  profile: "",
  study_form: "FULL_TIME",
  degree_level: "BACHELOR",
  total_graduates: "",
  admission_count: "",
  is_active: true,
};

const toFormData = (group: AcademicGroup): GroupFormData => ({
  name: group.name,
  graduation_year: group.graduation_year ? String(group.graduation_year) : "",
  direction_code: group.direction_code || "",
  direction_name: group.direction_name || "",
  profile: group.profile || "",
  study_form: group.study_form || "FULL_TIME",
  degree_level: group.degree_level || "BACHELOR",
  total_graduates: group.total_graduates ? String(group.total_graduates) : "",
  admission_count: group.admission_count ? String(group.admission_count) : "",
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
  total_graduates: form.total_graduates ? Number(form.total_graduates) : null,
  admission_count: form.admission_count ? Number(form.admission_count) : null,
  is_active: form.is_active,
});

const AdminGroupsPage: React.FC = () => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [formData, setFormData] = useState<GroupFormData>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => (b.graduation_year ?? 0) - (a.graduation_year ?? 0) || a.name.localeCompare(b.name)),
    [groups]
  );

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("alumni/academic-groups/");
      setGroups(res.data as AcademicGroup[]);
    } catch (error) {
      console.error("Error loading academic groups", error);
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const nextValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`alumni/academic-groups/${editingId}/`, toPayload(formData));
      } else {
        await api.post("alumni/academic-groups/", toPayload(formData));
      }
      toast.success(t("common.success"));
      resetForm();
      await loadGroups();
    } catch (error) {
      console.error("Error saving academic group", error);
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (group: AcademicGroup) => {
    setEditingId(group.id);
    setFormData(toFormData(group));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (group: AcademicGroup) => {
    if (!window.confirm(t("common.confirmDelete"))) return;
    try {
      await api.delete(`alumni/academic-groups/${group.id}/`);
      toast.success(t("common.success"));
      await loadGroups();
      if (editingId === group.id) resetForm();
    } catch (error) {
      console.error("Error deleting academic group", error);
      toast.error(t("common.error"));
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-10 py-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{t("admin.groupsManagement")}</h1>
        <p className="text-sm text-gray-500">{t("admin.groupsManagementHint")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? t("admin.editGroup") : t("admin.addGroup")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.groupName")}</label>
              <input name="name" required value={formData.name} onChange={handleChange} className="w-full border rounded-md px-3 py-2" placeholder="ИСТТ-1-21" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.year")}</label>
              <input name="graduation_year" type="number" value={formData.graduation_year} onChange={handleChange} className="w-full border rounded-md px-3 py-2" placeholder="2026" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.directionCode")}</label>
              <input name="direction_code" value={formData.direction_code} onChange={handleChange} className="w-full border rounded-md px-3 py-2" placeholder="710200" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.directionName")}</label>
              <input name="direction_name" value={formData.direction_name} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.profileName")}</label>
              <input name="profile" value={formData.profile} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.studyForm")}</label>
              <select name="study_form" value={formData.study_form} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                <option value="FULL_TIME">{t("graduate.fullTime")}</option>
                <option value="PART_TIME">{t("graduate.partTime")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.degreeLevel")}</label>
              <select name="degree_level" value={formData.degree_level} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                <option value="BACHELOR">{t("graduate.bachelor")}</option>
                <option value="MASTER">{t("graduate.master")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.totalGraduates")}</label>
              <input name="total_graduates" type="number" value={formData.total_graduates} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.admissionCount")}</label>
              <input name="admission_count" type="number" value={formData.admission_count} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2 xl:col-span-3">
              <input name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} className="rounded border-gray-300" />
              {t("admin.groupActive")}
            </label>

            <div className="flex flex-wrap gap-3 md:col-span-2 xl:col-span-3">
              <Button type="submit" leftIcon={<Plus className="h-4 w-4" />} disabled={saving}>
                {editingId ? t("common.save") : t("admin.addGroup")}
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
          <CardTitle>{t("admin.groupsList")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-gray-500">{t("common.loading")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left">{t("graduate.group")}</th>
                    <th className="px-6 py-3 text-left">{t("admin.year")}</th>
                    <th className="px-6 py-3 text-left">{t("graduate.direction")}</th>
                    <th className="px-6 py-3 text-left">{t("graduate.profileName")}</th>
                    <th className="px-6 py-3 text-left">{t("graduate.studyForm")}</th>
                    <th className="px-6 py-3 text-left">{t("common.status")}</th>
                    <th className="px-6 py-3 text-right">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-primary-50/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-primary-600" />
                          {group.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{group.graduation_year || t("common.notSpecified")}</td>
                      <td className="px-6 py-4 min-w-[220px]">
                        <div className="font-medium text-gray-900">{group.direction_code}</div>
                        <div className="text-xs text-gray-500">{group.direction_name}</div>
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">{group.profile || t("common.notSpecified")}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{group.study_form_display || group.study_form}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${group.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {group.is_active ? t("admin.active") : t("admin.inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex gap-2">
                          <Button size="sm" variant="outline" leftIcon={<Edit className="h-4 w-4" />} onClick={() => handleEdit(group)}>
                            {t("common.edit")}
                          </Button>
                          <Button size="sm" variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(group)}>
                            {t("common.delete")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!sortedGroups.length && (
                    <tr>
                      <td className="px-6 py-10 text-center text-gray-500" colSpan={7}>{t("admin.noGroups")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGroupsPage;
