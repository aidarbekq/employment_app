import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { getListResults } from "@/utils/pagination";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card, CardContent } from "@/components/common/Card";
import EmploymentStatusBadge from "@/components/common/EmploymentStatusBadge";
import { useTranslation } from "react-i18next";
import { BookOpen, Briefcase, CheckCircle, Edit3, GraduationCap, KeyRound, Mail, UserCircle } from "lucide-react";

interface UserInfo {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "ALUMNI" | "EMPLOYER" | "ADMIN";
}

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
}

type ProfileFormData = {
  academic_group_id: string;
  graduation_year: string;
  specialty: string;
  direction: string;
  education_profile: string;
  study_form: string;
  degree_level: string;
  is_surveyed: boolean;
  employment_status: string;
  workplace: string;
  position: string;
  continuing_education_place: string;
  useful_subjects: string;
  self_study_topics: string;
  first_name: string;
  last_name: string;
  email: string;
};

interface Profile {
  id: number;
  academic_group: AcademicGroup | null;
  graduation_year: number | null;
  specialty: string | null;
  direction: string | null;
  profile: string | null;
  study_form: string | null;
  study_form_display?: string;
  degree_level: string | null;
  degree_level_display?: string;
  is_surveyed: boolean;
  employment_status: string;
  employment_status_display?: string;
  workplace: string | null;
  employer: number | null;
  resume: string | null;
  position: string | null;
  continuing_education_place: string | null;
  useful_subjects: string | null;
  self_study_topics: string | null;
  user: number | UserInfo;
}

const emptyForm: ProfileFormData = {
  academic_group_id: "",
  graduation_year: "",
  specialty: "",
  direction: "",
  education_profile: "",
  study_form: "",
  degree_level: "BACHELOR",
  is_surveyed: true,
  employment_status: "UNEMPLOYED",
  workplace: "",
  position: "",
  continuing_education_place: "",
  useful_subjects: "",
  self_study_topics: "",
  first_name: "",
  last_name: "",
  email: "",
};

const inputClass = "rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(emptyForm);

  const selectedGroup = useMemo(
    () => groups.find((group) => String(group.id) === formData.academic_group_id) ?? null,
    [groups, formData.academic_group_id]
  );

  const fillForm = (item: Profile) => {
    const userInfo = typeof item.user === "object" ? item.user : null;
    setFormData({
      academic_group_id: item.academic_group?.id ? String(item.academic_group.id) : "",
      graduation_year: item.graduation_year?.toString() || item.academic_group?.graduation_year?.toString() || "",
      specialty: item.specialty || "",
      direction: item.direction || item.academic_group?.direction_name || "",
      education_profile: item.profile || item.academic_group?.profile || "",
      study_form: item.study_form || item.academic_group?.study_form || "",
      degree_level: item.degree_level || item.academic_group?.degree_level || "BACHELOR",
      is_surveyed: item.is_surveyed ?? true,
      employment_status: item.employment_status || "UNEMPLOYED",
      workplace: item.workplace || "",
      position: item.position || "",
      continuing_education_place: item.continuing_education_place || "",
      useful_subjects: item.useful_subjects || "",
      self_study_topics: item.self_study_topics || "",
      first_name: userInfo?.first_name || "",
      last_name: userInfo?.last_name || "",
      email: userInfo?.email || "",
    });
  };

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get("alumni/alumni-profiles/", { params: { page_size: 100 } });
      const my = getListResults<Profile>(res.data).find((item) =>
        typeof item.user === "object" ? item.user.id === user.id : item.user === user.id
      );
      if (!my) return;
      setProfile(my);
      fillForm(my);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    api
      .get("alumni/academic-groups/", { params: { page_size: 100, ordering: "-graduation_year,name" } })
      .then((res) => setGroups(getListResults<AcademicGroup>(res.data)))
      .catch(() => toast.error(t("common.error")));
  }, [t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const nextValue = e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    const group = groups.find((item) => String(item.id) === groupId);

    setFormData((prev) => ({
      ...prev,
      academic_group_id: groupId,
      graduation_year: group?.graduation_year ? String(group.graduation_year) : prev.graduation_year,
      direction: group?.direction_name || prev.direction,
      education_profile: group?.profile || prev.education_profile,
      study_form: group?.study_form || prev.study_form,
      degree_level: group?.degree_level || prev.degree_level,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await Promise.all([
        api.patch("users/me/", {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        }),
        api.patch(`alumni/alumni-profiles/${profile.id}/`, {
          academic_group_id: formData.academic_group_id ? Number(formData.academic_group_id) : null,
          graduation_year: formData.graduation_year ? Number(formData.graduation_year) : null,
          specialty: formData.specialty || null,
          direction: formData.direction || null,
          profile: formData.education_profile || null,
          study_form: formData.study_form || null,
          degree_level: formData.degree_level || "BACHELOR",
          is_surveyed: formData.is_surveyed,
          employment_status: formData.employment_status,
          workplace: formData.workplace || null,
          position: formData.position || null,
          continuing_education_place: formData.continuing_education_place || null,
          useful_subjects: formData.useful_subjects || null,
          self_study_topics: formData.self_study_topics || null,
        }),
      ]);
      toast.success(t("common.success"));
      setIsEditing(false);
      await fetchProfile();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleCancel = () => {
    if (profile) fillForm(profile);
    setIsEditing(false);
  };

  const displayName = `${formData.first_name} ${formData.last_name}`.trim() || (typeof profile?.user === "object" ? profile.user.username : t("graduate.profile"));
  const statusLabel = profile?.employment_status_display || formData.employment_status;
  const studyFormLabel = profile?.study_form_display || selectedGroup?.study_form_display || formData.study_form;
  const degreeLevelLabel = profile?.degree_level_display || selectedGroup?.degree_level_display || formData.degree_level;

  const EmptyValue = () => <span className="text-gray-400 italic">{t("common.notSpecified")}</span>;
  const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => {
    const isEmpty = value === null || value === undefined || value === "";
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">{label}</p>
        <div className="text-sm font-medium text-gray-900 break-words">{isEmpty ? <EmptyValue /> : value}</div>
      </div>
    );
  };

  const TextBlock = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">{label}</p>
      {value ? <p className="text-sm text-gray-800 leading-6 whitespace-pre-line break-words">{value}</p> : <EmptyValue />}
    </div>
  );

  if (loading) return <p className="text-center mt-8 text-gray-500">{t("common.loading")}</p>;
  if (!profile) return <p className="text-center mt-8 text-red-600">{t("common.error")}</p>;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-0 py-4 sm:px-4 sm:py-8">
      <Card className="overflow-hidden rounded-2xl border-gray-100 shadow-sm">
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-4 py-6 text-white sm:px-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                <UserCircle className="h-10 w-10 text-white" />
              </div>
              <div>
                <p className="text-sm text-primary-100">{t("graduate.profile")}</p>
                <h1 className="text-2xl font-bold leading-tight break-words">{displayName}</h1>
                <p className="text-primary-100 text-sm mt-1 inline-flex max-w-full items-center gap-2 break-words">
                  <Mail className="h-4 w-4" />
                  {formData.email || t("common.notSpecified")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <EmploymentStatusBadge status={profile.employment_status} label={statusLabel} className="px-4 py-2" />
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                {formData.is_surveyed ? t("graduate.isSurveyed") : t("graduate.notSurveyed")}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">
          {!isEditing ? (
            <div className="space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t("admin.educationData")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <InfoItem label={t("graduate.group")} value={profile.academic_group?.name} />
                  <InfoItem label={t("graduate.graduation_year")} value={formData.graduation_year} />
                  <InfoItem label={t("graduate.studyForm")} value={studyFormLabel} />
                  <InfoItem label={t("graduate.degreeLevel")} value={degreeLevelLabel} />
                  <InfoItem label={t("graduate.direction")} value={formData.direction} />
                  <InfoItem label={t("graduate.profileName")} value={formData.education_profile || formData.specialty} />
                  <InfoItem label={t("graduate.specialty")} value={formData.specialty} />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t("admin.employmentData")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <InfoItem label={t("graduate.workplace")} value={formData.workplace} />
                  <InfoItem label={t("graduate.position")} value={formData.position} />
                  <InfoItem label={t("graduate.continuingEducationPlace")} value={formData.continuing_education_place} />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t("graduate.surveyInfo")}</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <TextBlock label={t("graduate.usefulSubjects")} value={formData.useful_subjects} />
                  <TextBlock label={t("graduate.selfStudyTopics")} value={formData.self_study_topics} />
                </div>
              </section>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button variant="outline" leftIcon={<KeyRound className="h-4 w-4" />} onClick={() => navigate('/graduate/security')}>
                  {t("security.changePassword")}
                </Button>
                <Button leftIcon={<Edit3 className="h-4 w-4" />} onClick={() => setIsEditing(true)}>
                  {t("common.edit")}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("admin.personalData")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input id="first_name" name="first_name" label={t("auth.firstName")} value={formData.first_name} onChange={handleInputChange} className={inputClass} />
                  <Input id="last_name" name="last_name" label={t("auth.lastName")} value={formData.last_name} onChange={handleInputChange} className={inputClass} />
                  <Input id="email" name="email" label={t("auth.email")} type="email" value={formData.email} onChange={handleInputChange} className={inputClass} />
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("admin.educationData")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">{t("graduate.group")}</label>
                    <select name="academic_group_id" value={formData.academic_group_id} onChange={handleGroupChange} className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">{t("common.notSpecified")}</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>
                  <Input id="graduation_year" name="graduation_year" label={t("graduate.graduation_year")} type="number" value={formData.graduation_year} onChange={handleInputChange} className={inputClass} />
                  <Input id="specialty" name="specialty" label={t("graduate.specialty")} value={formData.specialty} onChange={handleInputChange} className={inputClass} />
                  <Input id="direction" name="direction" label={t("graduate.direction")} value={formData.direction} onChange={handleInputChange} className={inputClass} />
                  <Input id="education_profile" name="education_profile" label={t("graduate.profileName")} value={formData.education_profile} onChange={handleInputChange} className={inputClass} />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">{t("graduate.studyForm")}</label>
                    <select name="study_form" value={formData.study_form} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">{t("common.notSpecified")}</option>
                      <option value="FULL_TIME">{t("graduate.fullTime")}</option>
                      <option value="PART_TIME">{t("graduate.partTime")}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">{t("graduate.degreeLevel")}</label>
                    <select name="degree_level" value={formData.degree_level} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="BACHELOR">{t("graduate.bachelor")}</option>
                      <option value="MASTER">{t("graduate.master")}</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
                    <input name="is_surveyed" type="checkbox" checked={formData.is_surveyed} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary-600" />
                      {t("graduate.isSurveyed")}
                    </span>
                  </label>
                </div>
                {selectedGroup && (
                  <p className="mt-3 text-sm text-primary-700 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
                    {t("admin.groupAutofillHint", { group: selectedGroup.name })}
                  </p>
                )}
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("admin.employmentData")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">{t("graduate.employmentStatus")}</label>
                    <select name="employment_status" value={formData.employment_status} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="EMPLOYED_SPECIALTY">{t("graduate.employedSpecialty")}</option>
                      <option value="EMPLOYED_NOT_SPECIALTY">{t("graduate.employedNotSpecialty")}</option>
                      <option value="SELF_EMPLOYED">{t("graduate.selfEmployed")}</option>
                      <option value="CONTINUING_EDUCATION">{t("graduate.continuingEducation")}</option>
                      <option value="UNEMPLOYED">{t("graduate.unemployed")}</option>
                      <option value="LOST_CONTACT">{t("graduate.lostContact")}</option>
                    </select>
                  </div>
                  <Input id="workplace" name="workplace" label={t("graduate.workplace")} value={formData.workplace} onChange={handleInputChange} className={inputClass} />
                  <Input id="position" name="position" label={t("graduate.position")} value={formData.position} onChange={handleInputChange} className={inputClass} />
                  <Input id="continuing_education_place" name="continuing_education_place" label={t("graduate.continuingEducationPlace")} value={formData.continuing_education_place} onChange={handleInputChange} className={inputClass} />
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("graduate.surveyInfo")}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.usefulSubjects")}</label>
                    <textarea name="useful_subjects" value={formData.useful_subjects} onChange={handleInputChange} rows={4} className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.selfStudyTopics")}</label>
                    <textarea name="self_study_topics" value={formData.self_study_topics} onChange={handleInputChange} rows={4} className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
              </section>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button type="submit" className="w-full sm:w-auto">{t("common.save")}</Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
