import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { useTranslation } from "react-i18next";

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

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
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
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("alumni/alumni-profiles/");
        const my = (res.data as Profile[]).find((item) =>
          typeof item.user === "object" ? item.user.id === user?.id : item.user === user?.id
        );
        if (!my) return;

        setProfile(my);
        const userInfo = typeof my.user === "object" ? my.user : null;
        setFormData({
          graduation_year: my.graduation_year?.toString() || "",
          specialty: my.specialty || "",
          employment_status: my.employment_status || "UNEMPLOYED",
          workplace: my.workplace || "",
          position: my.position || "",
          continuing_education_place: my.continuing_education_place || "",
          useful_subjects: my.useful_subjects || "",
          self_study_topics: my.self_study_topics || "",
          first_name: userInfo?.first_name || "",
          last_name: userInfo?.last_name || "",
          email: userInfo?.email || "",
        });
      } catch {
        toast.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user, t]);

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
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    const userInfo = typeof profile.user === "object" ? profile.user : null;
    setFormData({
      graduation_year: profile.graduation_year?.toString() || "",
      specialty: profile.specialty || "",
      employment_status: profile.employment_status || "UNEMPLOYED",
      workplace: profile.workplace || "",
      position: profile.position || "",
      continuing_education_place: profile.continuing_education_place || "",
      useful_subjects: profile.useful_subjects || "",
      self_study_topics: profile.self_study_topics || "",
      first_name: userInfo?.first_name || "",
      last_name: userInfo?.last_name || "",
      email: userInfo?.email || "",
    });
    setIsEditing(false);
  };

  const editableFields: Array<{ name: Exclude<keyof ProfileFormData, "employment_status" | "useful_subjects" | "self_study_topics">; label: string; type?: string }> = [
    { name: "first_name", label: t("auth.firstName") },
    { name: "last_name", label: t("auth.lastName") },
    { name: "email", label: t("auth.email"), type: "email" },
    { name: "graduation_year", label: t("graduate.graduation_year"), type: "number" },
    { name: "specialty", label: t("graduate.specialty") },
    { name: "workplace", label: t("graduate.workplace") },
    { name: "position", label: t("graduate.position") },
    { name: "continuing_education_place", label: t("graduate.continuingEducationPlace") },
  ];

  if (loading) return <p className="text-center mt-8">{t("common.loading")}</p>;
  if (!profile) return <p className="text-center mt-8 text-red-600">{t("common.error")}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("graduate.profile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing ? (
            <div className="text-gray-800 text-base space-y-2">
              <p><strong>{t("auth.firstName")}:</strong> {formData.first_name}</p>
              <p><strong>{t("auth.lastName")}:</strong> {formData.last_name}</p>
              <p><strong>{t("auth.email")}:</strong> {formData.email}</p>
              <p><strong>{t("graduate.group")}:</strong> {profile.academic_group?.name || "—"}</p>
              <p><strong>{t("graduate.graduation_year")}:</strong> {formData.graduation_year || "—"}</p>
              <p><strong>{t("graduate.direction")}:</strong> {profile.direction || "—"}</p>
              <p><strong>{t("graduate.profileName")}:</strong> {profile.profile || "—"}</p>
              <p><strong>{t("graduate.studyForm")}:</strong> {profile.study_form_display || "—"}</p>
              <p><strong>{t("graduate.specialty")}:</strong> {formData.specialty || "—"}</p>
              <p><strong>{t("graduate.employmentStatus")}:</strong> {profile.employment_status_display || formData.employment_status}</p>
              <p><strong>{t("graduate.workplace")}:</strong> {formData.workplace || "—"}</p>
              <p><strong>{t("graduate.position")}:</strong> {formData.position || "—"}</p>
              <p><strong>{t("graduate.continuingEducationPlace")}:</strong> {formData.continuing_education_place || "—"}</p>
              <p><strong>{t("graduate.usefulSubjects")}:</strong> {formData.useful_subjects || "—"}</p>
              <p><strong>{t("graduate.selfStudyTopics")}:</strong> {formData.self_study_topics || "—"}</p>
              <div className="pt-4 text-right">
                <Button onClick={() => setIsEditing(true)}>{t("common.edit")}</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {editableFields.map(({ name, label, type = "text" }) => (
                <Input key={name} id={name} name={name} label={label} type={type} value={formData[name]} onChange={handleChange} />
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.employmentStatus")}</label>
                <select name="employment_status" value={formData.employment_status} onChange={handleChange} className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500">
                  <option value="EMPLOYED_SPECIALTY">{t("graduate.employedSpecialty")}</option>
                  <option value="EMPLOYED_NOT_SPECIALTY">{t("graduate.employedNotSpecialty")}</option>
                  <option value="SELF_EMPLOYED">{t("graduate.selfEmployed")}</option>
                  <option value="CONTINUING_EDUCATION">{t("graduate.continuingEducation")}</option>
                  <option value="UNEMPLOYED">{t("graduate.unemployed")}</option>
                  <option value="LOST_CONTACT">{t("graduate.lostContact")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.usefulSubjects")}</label>
                <textarea name="useful_subjects" value={formData.useful_subjects} onChange={handleChange} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("graduate.selfStudyTopics")}</label>
                <textarea name="self_study_topics" value={formData.self_study_topics} onChange={handleChange} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
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
