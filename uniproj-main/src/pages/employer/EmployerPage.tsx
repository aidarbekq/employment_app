import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface UserInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface EmployerProfile {
  id: number;
  company_name: string;
  address: string;
  phone: string;
  description: string;
  user: UserInfo;
}

const EmployerPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    address: "",
    phone: "",
    description: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await api.get("employers/employers/");
        const my = res.data.find((p: EmployerProfile) => p.user?.id === user?.id);
        if (!my) {
          setProfile(null);
          toast.error(t("common.error"));
          return;
        }
        setProfile(my);
        setFormData({
          company_name: my.company_name,
          address: my.address,
          phone: my.phone,
          description: my.description,
          first_name: my.user.first_name || "",
          last_name: my.user.last_name || "",
          email: my.user.email || "",
        });
      } catch (error) {
        console.error("❌ Ошибка загрузки профиля", error);
        toast.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyProfile();
  }, [user, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    } catch (error) {
      console.error("❌ Ошибка при сохранении", error);
      toast.error(t("common.error"));
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    setFormData({
      company_name: profile.company_name,
      address: profile.address,
      phone: profile.phone,
      description: profile.description,
      first_name: profile.user.first_name || "",
      last_name: profile.user.last_name || "",
      email: profile.user.email || "",
    });
    setIsEditing(false);
  };

  if (loading) return <p className="text-center mt-8 text-gray-500">{t("common.loading")}</p>;
  if (!profile) return <p className="text-center mt-8 text-red-600">{t("common.error")}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 sm:p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{t("employer.company")}</h1>

      {!isEditing ? (
        <div className="space-y-4 text-gray-700 text-base">
          <p><span className="font-medium">{t("employer.company_name")}:</span> {formData.company_name}</p>
          <p><span className="font-medium">{t("employer.address")}:</span> {formData.address}</p>
          <p><span className="font-medium">{t("employer.phone")}:</span> {formData.phone}</p>
          <p><span className="font-medium">{t("employer.description")}:</span> {formData.description}</p>
          <p><span className="font-medium">{t("auth.firstName") || "Имя"}:</span> {formData.first_name}</p>
          <p><span className="font-medium">{t("auth.lastName") || "Фамилия"}:</span> {formData.last_name}</p>
          <p><span className="font-medium">{t("auth.email")}:</span> {formData.email}</p>

          <div className="pt-6 text-right">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {t("common.edit")}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-sm text-gray-700">
          {["company_name", "address", "phone", "first_name", "last_name", "email"].map((field) => (
            <div key={field}>
              <label className="block mb-1 font-medium">{t(`employer.${field}`) || field}</label>
              <input
                name={field}
                value={(formData as any)[field]}
                onChange={handleChange}
                type={field === "email" ? "email" : "text"}
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block mb-1 font-medium">{t("employer.description")}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              {t("common.save")}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmployerPage;
