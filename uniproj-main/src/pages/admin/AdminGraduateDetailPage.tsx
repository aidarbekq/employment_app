import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Graduate {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  graduation_year: number;
  specialty: string;
  is_employed: boolean;
  employer: number | null;
  position: string;
  resume: string | null;
}

const AdminGraduateDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [graduate, setGraduate] = useState<Graduate | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    specialty: "",
    graduation_year: "",
    position: "",
    is_employed: false,
    employer: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    api.get(`alumni/alumni-profiles/${id}/`)
      .then((res) => {
        const g = res.data;
        setGraduate(g);
        setForm({
          specialty: g.specialty ?? "",
          graduation_year: g.graduation_year?.toString() ?? "",
          position: g.position ?? "",
          is_employed: g.is_employed ?? false,
          employer: g.employer?.toString() ?? "",
          first_name: g.user.first_name ?? "",
          last_name: g.user.last_name ?? "",
          email: g.user.email ?? "",
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
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      if (!graduate) return;

      // 1. Обновить user
      await api.put(`users/user/${graduate.user.id}/`, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
      });

      // 2. Обновить alumni
      await api.put(`alumni/alumni-profiles/${id}/`, {
        specialty: form.specialty,
        graduation_year: parseInt(form.graduation_year),
        position: form.position,
        is_employed: form.is_employed,
        employer: form.employer || null,
      });

      toast.success(t("common.success"));
      navigate("/admin/graduates");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(t("common.error"));
    }
  };

  const handleDelete = async () => {
    if (confirm(t("common.confirmDelete"))) {
      try {
        await api.delete(`alumni/alumni-profiles/${id}/`);
        toast.success(t("common.success"));
        navigate("/admin/graduates");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(t("common.error"));
      }
    }
  };

  if (loading || !graduate)
    return <p className="text-center mt-10">{t("common.loading")}</p>;

  return (
    <div className="max-w-xl mx-auto space-y-6 px-4 md:px-0 py-6">
      <h1 className="text-2xl font-bold text-gray-800">
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("graduate.updateProfile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            name="first_name"
            label={t("user.first_name")}
            value={form.first_name}
            onChange={handleChange}
          />
          <Input
            name="last_name"
            label={t("user.last_name")}
            value={form.last_name}
            onChange={handleChange}
          />
          <Input
            name="email"
            label={t("user.email")}
            value={form.email}
            onChange={handleChange}
            type="email"
          />
          <Input
            name="specialty"
            label={t("graduate.specialty")}
            value={form.specialty}
            onChange={handleChange}
          />
          <Input
            name="graduation_year"
            label={t("graduate.graduation_year")}
            value={form.graduation_year}
            onChange={handleChange}
            type="number"
          />
          <Input
            name="position"
            label={t("graduate.position")}
            value={form.position}
            onChange={handleChange}
          />
          <Input
            name="employer"
            label={t("admin.employerId")}
            value={form.employer}
            onChange={handleChange}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_employed"
              checked={form.is_employed}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <span>{t("graduate.employed")}</span>
          </label>

          {graduate.resume && (
            <a
              href={graduate.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline block"
            >
              📎 {t("graduate.resume")}
            </a>
          )}

          <div className="flex justify-between mt-6 gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              className="text-red-600 border-red-500 hover:bg-red-100"
              onClick={handleDelete}
            >
              {t("common.delete")}
            </Button>
            <Button onClick={handleUpdate}>{t("common.save")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGraduateDetailPage;
