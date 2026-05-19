import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/services/api";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";

const VacancyEditPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
        });
      } catch (err) {
        console.error("Vacancy loading error:", err);
        toast.error(t("vacancy.errorLoad"));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVacancy();
  }, [id, t]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      await api.put(`vacancies/vacancies/${id}/`, formData);
      toast.success(t("vacancy.successUpdate"));
      setTimeout(() => navigate("/employer/vacancies"), 1000);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(t("vacancy.errorUpdate"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">{t("common.loading")}</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t("vacancy.editHeading")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("vacancy.editFormTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium text-gray-700">{t("vacancy.title")} *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder={t("vacancy.placeholderTitle")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">{t("vacancy.description")} *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder={t("vacancy.placeholderDescription")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">{t("vacancy.requirements")}</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder={t("vacancy.placeholderRequirements")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">{t("vacancy.location")} *</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder={t("vacancy.placeholderLocation")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">{t("vacancy.salary")}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 pl-7"
                  placeholder={t("vacancy.placeholderSalary")}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? t("vacancy.updating") : t("vacancy.updateVacancy")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VacancyEditPage;
