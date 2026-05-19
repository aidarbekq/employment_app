import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Save, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import api from "@/services/api";

interface AcademicGroup {
  id: number;
  name: string;
  graduation_year: number | null;
  direction_name: string;
  profile: string;
  study_form: "FULL_TIME" | "PART_TIME";
  degree_level: "BACHELOR" | "MASTER";
}

type EmploymentStatus =
  | "EMPLOYED_SPECIALTY"
  | "EMPLOYED_NOT_SPECIALTY"
  | "SELF_EMPLOYED"
  | "CONTINUING_EDUCATION"
  | "UNEMPLOYED"
  | "LOST_CONTACT";

interface GraduateCreateForm {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  academic_group_id: string;
  graduation_year: string;
  specialty: string;
  direction: string;
  profile: string;
  study_form: "" | "FULL_TIME" | "PART_TIME";
  degree_level: "BACHELOR" | "MASTER";
  is_surveyed: boolean;
  employment_status: EmploymentStatus;
  workplace: string;
  position: string;
  continuing_education_place: string;
  useful_subjects: string;
  self_study_topics: string;
}

const initialForm: GraduateCreateForm = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "DemoPass123!",
  academic_group_id: "",
  graduation_year: "",
  specialty: "",
  direction: "",
  profile: "",
  study_form: "",
  degree_level: "BACHELOR",
  is_surveyed: true,
  employment_status: "UNEMPLOYED",
  workplace: "",
  position: "",
  continuing_education_place: "",
  useful_subjects: "",
  self_study_topics: "",
};

const AdminGraduateCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [form, setForm] = useState<GraduateCreateForm>(initialForm);
  const [saving, setSaving] = useState(false);

  const selectedGroup = useMemo(
    () => groups.find((group) => String(group.id) === form.academic_group_id),
    [groups, form.academic_group_id]
  );

  useEffect(() => {
    api
      .get("alumni/academic-groups/")
      .then((res) => setGroups(res.data as AcademicGroup[]))
      .catch((error) => {
        console.error("Failed to load academic groups", error);
        toast.error(t("common.error"));
      });
  }, [t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value } as GraduateCreateForm;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await api.post("alumni/alumni-profiles/", payload);
      toast.success(t("common.success"));
      navigate("/admin/graduates");
    } catch (error) {
      console.error("Failed to create graduate", error);
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-primary-600" />
          {t("admin.addGraduate")}
        </h1>
        <p className="text-sm text-gray-500">{t("admin.addGraduateHint")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.personalData")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="first_name" label={t("auth.firstName")} value={form.first_name} onChange={handleInputChange} required />
            <Input name="last_name" label={t("auth.lastName")} value={form.last_name} onChange={handleInputChange} required />
            <Input name="username" label={t("auth.username")} value={form.username} onChange={handleInputChange} required />
            <Input name="email" label={t("auth.email")} type="email" value={form.email} onChange={handleInputChange} required />
            <Input name="password" label={t("auth.password")} value={form.password} onChange={handleInputChange} required />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.educationData")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t("graduate.group")}</label>
              <select name="academic_group_id" value={form.academic_group_id} onChange={handleSelectChange} className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500">
                <option value="">{t("common.notSpecified")}</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <Input name="graduation_year" label={t("graduate.graduation_year")} type="number" value={form.graduation_year} onChange={handleInputChange} />
            <Input name="direction" label={t("graduate.direction")} value={form.direction} onChange={handleInputChange} />
            <Input name="profile" label={t("graduate.profileName")} value={form.profile} onChange={handleInputChange} />
            <Input name="specialty" label={t("graduate.specialty")} value={form.specialty} onChange={handleInputChange} />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.employmentData")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Input name="workplace" label={t("graduate.workplace")} value={form.workplace} onChange={handleInputChange} />
            <Input name="position" label={t("graduate.position")} value={form.position} onChange={handleInputChange} />
            <Input name="continuing_education_place" label={t("graduate.continuingEducationPlace")} value={form.continuing_education_place} onChange={handleInputChange} />
            <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
              <input name="is_surveyed" type="checkbox" checked={form.is_surveyed} onChange={handleInputChange} className="h-4 w-4" />
              {t("graduate.isSurveyed")}
            </label>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.usefulSubjects")}</label>
                <textarea name="useful_subjects" value={form.useful_subjects} onChange={handleTextareaChange} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.selfStudyTopics")}</label>
                <textarea name="self_study_topics" value={form.self_study_topics} onChange={handleTextareaChange} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/graduates")}>{t("common.cancel")}</Button>
          <Button type="submit" disabled={saving} leftIcon={<Save className="h-4 w-4" />}>{t("common.save")}</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminGraduateCreatePage;
