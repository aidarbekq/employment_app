import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { toast } from "sonner";

const VacancyCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("vacancies/vacancies/", formData);
      toast.success(t("vacancy.successCreate"));
      setTimeout(() => navigate("/employer/vacancies"), 1000);
    } catch (err: any) {
      console.error("Ошибка при создании:", err.response?.data || err.message);
      toast.error(t("vacancy.errorCreate"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t("vacancy.formHeading")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("vacancy.formTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                {t("vacancy.title")} *
              </label>
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
              <label className="block mb-1 font-medium text-gray-700">
                {t("vacancy.description")} *
              </label>
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
              <label className="block mb-1 font-medium text-gray-700">
                {t("vacancy.requirements")}
              </label>
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
              <label className="block mb-1 font-medium text-gray-700">
                {t("vacancy.location")} *
              </label>
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
              <label className="block mb-1 font-medium text-gray-700">
                {t("vacancy.salary")}
              </label>
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
              <Button type="submit" disabled={loading}>
                {loading ? t("vacancy.creating") : t("vacancy.createVacancy")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VacancyCreatePage;
