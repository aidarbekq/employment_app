import React, { useCallback, useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Building2, Edit3, Mail, MapPin, Phone, UserCircle } from "lucide-react";
import Button from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { InputField, TextareaField } from "@/components/common/FormControls";

interface UserInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

type EmployerFormData = {
  company_name: string;
  address: string;
  phone: string;
  description: string;
  first_name: string;
  last_name: string;
  email: string;
};

interface EmployerProfile {
  id: number;
  company_name: string;
  address: string;
  phone: string;
  description: string;
  user: UserInfo;
}

const emptyForm: EmployerFormData = {
  company_name: "",
  address: "",
  phone: "",
  description: "",
  first_name: "",
  last_name: "",
  email: "",
};

const EmployerPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmployerFormData>(emptyForm);

  const fillForm = (item: EmployerProfile) => {
    setFormData({
      company_name: item.company_name || "",
      address: item.address || "",
      phone: item.phone || "",
      description: item.description || "",
      first_name: item.user.first_name || "",
      last_name: item.user.last_name || "",
      email: item.user.email || "",
    });
  };

  const fetchMyProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get("employers/employers/");
      const my = (res.data as EmployerProfile[]).find((item) => item.user?.id === user.id);
      if (!my) {
        setProfile(null);
        toast.error(t("common.error"));
        return;
      }
      setProfile(my);
      fillForm(my);
    } catch (error) {
      console.error("Error loading employer profile", error);
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await Promise.all([
        api.put("users/me/", {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        }),
        api.put(`employers/employers/${profile.id}/`, {
          company_name: formData.company_name,
          address: formData.address,
          phone: formData.phone,
          description: formData.description,
        }),
      ]);
      toast.success(t("common.success"));
      setIsEditing(false);
      await fetchMyProfile();
    } catch (error) {
      console.error("Error saving employer profile", error);
      toast.error(t("common.error"));
    }
  };

  const handleCancel = () => {
    if (profile) fillForm(profile);
    setIsEditing(false);
  };

  const initials = formData.company_name.slice(0, 2).toUpperCase() || "—";

  const EmptyValue = () => <span className="text-gray-400 italic">{t("common.notSpecified")}</span>;
  const InfoItem = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
        {icon}
        {label}
      </div>
      {value ? <p className="text-sm font-medium text-gray-900 break-words">{value}</p> : <EmptyValue />}
    </div>
  );

  const editableFields: Array<Exclude<keyof EmployerFormData, "description">> = [
    "company_name",
    "address",
    "phone",
    "first_name",
    "last_name",
    "email",
  ];

  if (loading) return <p className="text-center mt-8 text-gray-500">{t("common.loading")}</p>;
  if (!profile) return <p className="text-center mt-8 text-red-600">{t("common.error")}</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-6 py-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
              <div>
                <p className="text-sm text-primary-100">{t("employer.profile")}</p>
                <h1 className="text-2xl font-bold">{formData.company_name || t("employer.company")}</h1>
                <p className="text-primary-100 text-sm mt-1">{formData.description || t("common.notSpecified")}</p>
              </div>
            </div>
            {!isEditing && (
              <Button
                leftIcon={<Edit3 className="h-4 w-4" />}
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white focus:ring-white/60"
              >
                {t("common.edit")}
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-6">
          {!isEditing ? (
            <div className="space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t("employer.company")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <InfoItem label={t("employer.company_name")} value={formData.company_name} icon={<Building2 className="h-4 w-4" />} />
                  <InfoItem label={t("employer.address")} value={formData.address} icon={<MapPin className="h-4 w-4" />} />
                  <InfoItem label={t("employer.phone")} value={formData.phone} icon={<Phone className="h-4 w-4" />} />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <UserCircle className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t("admin.personalData")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <InfoItem label={t("auth.firstName")} value={formData.first_name} icon={<UserCircle className="h-4 w-4" />} />
                  <InfoItem label={t("auth.lastName")} value={formData.last_name} icon={<UserCircle className="h-4 w-4" />} />
                  <InfoItem label={t("auth.email")} value={formData.email} icon={<Mail className="h-4 w-4" />} />
                </div>
              </section>

              <section className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">{t("employer.description")}</p>
                {formData.description ? <p className="text-sm text-gray-800 leading-6 whitespace-pre-line">{formData.description}</p> : <EmptyValue />}
              </section>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t("employer.company")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editableFields.map((field) => (
                    <InputField
                      key={field}
                      name={field}
                      label={t(`employer.${field}`)}
                      value={formData[field]}
                      onChange={handleChange}
                      type={field === "email" ? "email" : "text"}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <TextareaField
                  name="description"
                  label={t("employer.description")}
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                />
              </div>

              <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-xl backdrop-blur sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                  {t("common.cancel")}
                </Button>
                <Button type="submit" className="w-full sm:w-auto">{t("common.save")}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerPage;
