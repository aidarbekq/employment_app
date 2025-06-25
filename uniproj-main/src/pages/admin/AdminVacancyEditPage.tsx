import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { useTranslation } from "react-i18next";

const AdminVacancyEditPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
    is_active: false,
  });

  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const res = await api.get(`vacancies/vacancies/${id}/`);
        setFormData({
          title: res.data.title || "",
          description: res.data.description || "",
          requirements: res.data.requirements || "",
          location: res.data.location || "",
          salary: res.data.salary || "",
          is_active: res.data.is_active,
        });
      } catch {
        toast.error(t("vacancy.errorLoad"));
      } finally {
        setLoading(false);
      }
    };
    fetchVacancy();
  }, [id, t]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`vacancies/vacancies/${id}/`, formData);
      toast.success(t("vacancy.successUpdate"));
      navigate("/admin/vacancies");
    } catch (err) {
      toast.error(t("vacancy.errorUpdate"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          {t("vacancy.editHeading")}
        </h1>
        <Button variant="outline" onClick={() => navigate("/admin/vacancies")}>
          {t("common.cancel")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("vacancy.editFormTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              ["title", t("vacancy.title")],
              ["location", t("vacancy.location")],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  name={key}
                  value={(formData as any)[key]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            ))}

            {[
              ["description", t("vacancy.description"), 4],
              ["requirements", t("vacancy.requirements"), 3],
            ].map(([key, label, rows]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <textarea
                  name={key}
                  value={(formData as any)[key]}
                  onChange={handleChange}
                  rows={rows as number}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required={key === "description"}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1">{t("vacancy.salary")}</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <label className="inline-flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="accent-blue-600"
              />
              <span>{t("vacancy.active")}</span>
            </label>

            <Button type="submit" className="w-full">
              {t("vacancy.updateVacancy")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVacancyEditPage;
