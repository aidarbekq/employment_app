import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Save, Trash2 } from "lucide-react";
import api from "@/services/api";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";

interface AcademicGroup {
  id: number;
  name: string;
  graduation_year: number | null;
  direction_name: string;
  profile: string;
  study_form: "FULL_TIME" | "PART_TIME";
  degree_level: "BACHELOR" | "MASTER";
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
  study_form: "FULL_TIME" | "PART_TIME" | null;
  degree_level: "BACHELOR" | "MASTER";
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
  study_form: "" | "FULL_TIME" | "PART_TIME";
  degree_level: "BACHELOR" | "MASTER";
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

const AdminGraduateDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [graduate, setGraduate] = useState<Graduate | null>(null);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<GraduateForm>({
    academic_group_id: "",
    specialty: "",
    graduation_year: "",
    direction: "",
    profile: "",
    study_form: "",
    degree_level: "BACHELOR",
    is_surveyed: true,
    employment_status: "UNEMPLOYED",
    workplace: "",
    position: "",
    employer: "",
    continuing_education_place: "",
    useful_subjects: "",
    self_study_topics: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  const selectedGroup = useMemo(
    () => groups.find((group) => String(group.id) === form.academic_group_id),
    [groups, form.academic_group_id]
  );

  useEffect(() => {
    Promise.all([
      api.get(`alumni/alumni-profiles/${id}/`),
      api.get("alumni/academic-groups/"),
    ])
      .then(([graduateResponse, groupResponse]) => {
        const data = graduateResponse.data as Graduate;
        setGraduate(data);
        setGroups(groupResponse.data as AcademicGroup[]);
        setForm({
          academic_group_id: data.academic_group ? String(data.academic_group.id) : "",
          specialty: data.specialty ?? "",
          graduation_year: data.graduation_year?.toString() ?? "",
          direction: data.direction ?? "",
          profile: data.profile ?? "",
          study_form: data.study_form ?? "",
          degree_level: data.degree_level ?? "BACHELOR",
          is_surveyed: data.is_surveyed ?? true,
          employment_status: data.employment_status ?? "UNEMPLOYED",
          workplace: data.workplace ?? "",
          position: data.position ?? "",
          employer: data.employer?.toString() ?? "",
          continuing_education_place: data.continuing_education_place ?? "",
          useful_subjects: data.useful_subjects ?? "",
          self_study_topics: data.self_study_topics ?? "",
          first_name: data.user.first_name ?? "",
          last_name: data.user.last_name ?? "",
          email: data.user.email ?? "",
        });
      })
      .catch((err) => {
        console.error("Load error:", err);
        toast.error(t("common.error"));
      })
      .finally(() => setLoading(false));
  }, [id, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value } as GraduateForm;
      if (name === "academic_group_id") {
        const group = groups.find((item) => String(item.id) === value);
        if (group) {
          next.graduation_year = group.graduation_year ? String(group.graduation_year) : prev.graduation_year;
          next.direction = group.direction_name;
          next.profile = group.profile;
          next.study_form = group.study_form;
          next.degree_level = group.degree_level;
          next.specialty = group.profile || prev.specialty;
        }
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
      toast.success(t("common.success"));
      navigate("/admin/graduates");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("common.confirmDelete"))) return;
    try {
      await api.delete(`alumni/alumni-profiles/${id}/`);
      toast.success(t("common.success"));
      navigate("/admin/graduates");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(t("common.error"));
    }
  };

  if (loading || !graduate) return <p className="text-center mt-10">{t("common.loading")}</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 md:px-8 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {form.first_name} {form.last_name}
        </h1>
        <p className="text-sm text-gray-500">{graduate.employment_status_display || form.employment_status}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("graduate.updateProfile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="first_name" label={t("auth.firstName")} value={form.first_name} onChange={handleChange} />
            <Input name="last_name" label={t("auth.lastName")} value={form.last_name} onChange={handleChange} />
            <Input name="email" label={t("auth.email")} value={form.email} onChange={handleChange} type="email" />
            <Input name="graduation_year" label={t("graduate.graduation_year")} value={form.graduation_year} onChange={handleChange} type="number" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t("graduate.group")}</label>
              <select name="academic_group_id" value={form.academic_group_id} onChange={handleSelectChange} className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500">
                <option value="">{t("common.notSpecified")}</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            <Input name="direction" label={t("graduate.direction")} value={form.direction} onChange={handleChange} />
            <Input name="profile" label={t("graduate.profileName")} value={form.profile} onChange={handleChange} />
            <Input name="specialty" label={t("graduate.specialty")} value={form.specialty} onChange={handleChange} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t("graduate.studyForm")}</label>
              <select name="study_form" value={form.study_form} onChange={handleSelectChange} className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500">
                <option value="">{t("common.notSpecified")}</option>
                <option value="FULL_TIME">{t("graduate.fullTime")}</option>
                <option value="PART_TIME">{t("graduate.partTime")}</option>
              </select>
            </div>
            {selectedGroup && (
              <div className="md:col-span-2 rounded-lg bg-primary-50 border border-primary-100 p-3 text-sm text-primary-800">
                {t("admin.groupAutofillHint", { group: selectedGroup.name })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t("graduate.employmentStatus")}</label>
              <select name="employment_status" value={form.employment_status} onChange={handleSelectChange} className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500">
                <option value="EMPLOYED_SPECIALTY">{t("graduate.employedSpecialty")}</option>
                <option value="EMPLOYED_NOT_SPECIALTY">{t("graduate.employedNotSpecialty")}</option>
                <option value="SELF_EMPLOYED">{t("graduate.selfEmployed")}</option>
                <option value="CONTINUING_EDUCATION">{t("graduate.continuingEducation")}</option>
                <option value="UNEMPLOYED">{t("graduate.unemployed")}</option>
                <option value="LOST_CONTACT">{t("graduate.lostContact")}</option>
              </select>
            </div>
            <Input name="workplace" label={t("graduate.workplace")} value={form.workplace} onChange={handleChange} />
            <Input name="position" label={t("graduate.position")} value={form.position} onChange={handleChange} />
            <Input name="employer" label={t("admin.employerId")} value={form.employer} onChange={handleChange} />
            <Input name="continuing_education_place" label={t("graduate.continuingEducationPlace")} value={form.continuing_education_place} onChange={handleChange} />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="is_surveyed" checked={form.is_surveyed} onChange={handleChange} className="h-4 w-4" />
              {t("graduate.isSurveyed")}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.usefulSubjects")}</label>
              <textarea name="useful_subjects" value={form.useful_subjects} onChange={handleTextareaChange} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.selfStudyTopics")}</label>
              <textarea name="self_study_topics" value={form.self_study_topics} onChange={handleTextareaChange} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
          </div>

          {graduate.resume && (
            <a href={graduate.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
              📎 {t("graduate.resume")}
            </a>
          )}

          <div className="flex justify-between mt-6 gap-2 flex-col sm:flex-row">
            <Button variant="outline" className="text-red-600 border-red-500 hover:bg-red-100" leftIcon={<Trash2 className="h-4 w-4" />} onClick={handleDelete}>
              {t("common.delete")}
            </Button>
            <Button onClick={handleUpdate} disabled={saving} leftIcon={<Save className="h-4 w-4" />}>
              {t("common.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGraduateDetailPage;
