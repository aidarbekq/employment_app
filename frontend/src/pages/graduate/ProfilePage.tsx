import React, { useCallback, useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card, CardContent } from "@/components/common/Card";
import { useTranslation } from "react-i18next";
import { BookOpen, Briefcase, Edit3, GraduationCap, Mail, UserCircle } from "lucide-react";

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
}

type ProfileFormData = {
  graduation_year: string;
  specialty: string;
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
  study_form_display?: string;
  degree_level_display?: string;
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
  graduation_year: "",
  specialty: "",
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

const statusBadgeClass = (status: string) => {
  if (status === "EMPLOYED_SPECIALTY") return "bg-green-50 text-green-700 border-green-100";
  if (status === "EMPLOYED_NOT_SPECIALTY" || status === "SELF_EMPLOYED") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "CONTINUING_EDUCATION") return "bg-indigo-50 text-indigo-700 border-indigo-100";
  if (status === "LOST_CONTACT") return "bg-gray-100 text-gray-600 border-gray-200";
  return "bg-yellow-50 text-yellow-700 border-yellow-100";
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(emptyForm);

  const fillForm = (item: Profile) => {
    const userInfo = typeof item.user === "object" ? item.user : null;
    setFormData({
      graduation_year: item.graduation_year?.toString() || "",
      specialty: item.specialty || "",
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
      const res = await api.get("alumni/alumni-profiles/");
      const my = (res.data as Profile[]).find((item) =>
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
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          graduation_year: formData.graduation_year ? Number(formData.graduation_year) : null,
          specialty: formData.specialty || null,
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

  const personFields: Array<{ name: keyof Pick<ProfileFormData, "first_name" | "last_name" | "email">; label: string; type?: string }> = [
    { name: "first_name", label: t("auth.firstName") },
    { name: "last_name", label: t("auth.lastName") },
    { name: "email", label: t("auth.email"), type: "email" },
  ];

  const employmentFields: Array<{ name: keyof Pick<ProfileFormData, "workplace" | "position" | "continuing_education_place">; label: string }> = [
    { name: "workplace", label: t("graduate.workplace") },
    { name: "position", label: t("graduate.position") },
    { name: "continuing_education_place", label: t("graduate.continuingEducationPlace") },
  ];

  const displayName = `${formData.first_name} ${formData.last_name}`.trim() || (typeof profile?.user === "object" ? profile.user.username : t("graduate.profile"));
  const statusLabel = profile?.employment_status_display || formData.employment_status;

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
      {value ? <p className="text-sm text-gray-800 leading-6 whitespace-pre-line">{value}</p> : <EmptyValue />}
    </div>
  );

  if (loading) return <p className="text-center mt-8 text-gray-500">{t("common.loading")}</p>;
  if (!profile) return <p className="text-center mt-8 text-red-600">{t("common.error")}</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-6 py-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                <UserCircle className="h-10 w-10 text-white" />
              </div>
              <div>
                <p className="text-sm text-primary-100">{t("graduate.profile")}</p>
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <p className="text-primary-100 text-sm mt-1 inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {formData.email || t("common.notSpecified")}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${statusBadgeClass(profile.employment_status)}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        <CardContent className="p-6">
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
                  <InfoItem label={t("graduate.studyForm")} value={profile.study_form_display} />
                  <InfoItem label={t("graduate.degreeLevel")} value={profile.degree_level_display} />
                  <InfoItem label={t("graduate.direction")} value={profile.direction} />
                  <InfoItem label={t("graduate.profileName")} value={profile.profile || formData.specialty} />
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

              <div className="pt-2 text-right">
                <Button leftIcon={<Edit3 className="h-4 w-4" />} onClick={() => setIsEditing(true)}>
                  {t("common.edit")}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("admin.personalData")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {personFields.map(({ name, label, type = "text" }) => (
                    <Input key={name} id={name} name={name} label={label} type={type} value={formData[name]} onChange={handleChange} />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("admin.educationData")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input id="graduation_year" name="graduation_year" label={t("graduate.graduation_year")} type="number" value={formData.graduation_year} onChange={handleChange} />
                  <Input id="specialty" name="specialty" label={t("graduate.specialty")} value={formData.specialty} onChange={handleChange} />
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("admin.employmentData")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.employmentStatus")}</label>
                    <select name="employment_status" value={formData.employment_status} onChange={handleChange} className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="EMPLOYED_SPECIALTY">{t("graduate.employedSpecialty")}</option>
                      <option value="EMPLOYED_NOT_SPECIALTY">{t("graduate.employedNotSpecialty")}</option>
                      <option value="SELF_EMPLOYED">{t("graduate.selfEmployed")}</option>
                      <option value="CONTINUING_EDUCATION">{t("graduate.continuingEducation")}</option>
                      <option value="UNEMPLOYED">{t("graduate.unemployed")}</option>
                      <option value="LOST_CONTACT">{t("graduate.lostContact")}</option>
                    </select>
                  </div>
                  {employmentFields.map(({ name, label }) => (
                    <Input key={name} id={name} name={name} label={label} value={formData[name]} onChange={handleChange} />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("graduate.surveyInfo")}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.usefulSubjects")}</label>
                    <textarea name="useful_subjects" value={formData.useful_subjects} onChange={handleChange} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.selfStudyTopics")}</label>
                    <textarea name="self_study_topics" value={formData.self_study_topics} onChange={handleChange} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
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
