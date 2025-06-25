import React, { useEffect, useState } from "react";
import {
  Briefcase, MapPin, Calendar, Pencil, Trash2, Plus, Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";

interface Vacancy {
  id: number;
  employer: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  is_active: boolean;
  created_at: string;
}

const VacanciesPage: React.FC = () => {
  const { t } = useTranslation();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const res = await api.get("vacancies/vacancies/");
        setVacancies(res.data);
      } catch (err) {
        console.error("Ошибка загрузки вакансий", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVacancies();
  }, []);

  const filtered = vacancies.filter((v) =>
    [v.title, v.location, v.employer].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await api.delete(`vacancies/vacancies/${deleteId}/`);
      setVacancies((prev) => prev.filter((v) => v.id !== deleteId));
    } catch (err) {
      console.error("Ошибка удаления", err);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800"></h1>
        <Button onClick={() => navigate("/employer/vacancies/create")}
          className="flex items-center">
          <Plus className="h-4 w-4 mr-1" /> {t("vacancy.addVacancy")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("employer.vacancies")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6">
            <div className="relative w-full md:w-96">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("common.search") + "..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filtered.map((v) => (
              <div key={v.id} className="border border-gray-200 rounded-lg bg-white px-4 py-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Briefcase className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{v.title}</h3>
                      <p className="text-sm text-gray-500">{v.employer}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      onClick={() => navigate(`/employer/vacancies/${v.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" /> {t("common.edit")}
                    </button>
                    <button
                      className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                      onClick={() => setDeleteId(v.id)}
                    >
                      <Trash2 className="h-4 w-4" /> {t("common.delete")}
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <h4 className="text-gray-900 font-medium mb-1">{t("vacancy.location")}</h4>
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      {v.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium mb-1">{t("vacancy.salary")}</h4>
                    <p>${v.salary || t("common.noResults")}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium mb-1">{t("vacancy.createdAt")}</h4>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {new Date(v.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium mb-1">{t("vacancy.description")}</h4>
                    <p className="line-clamp-3">{v.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {!filtered.length && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("common.noResults")}</h3>
                <p className="text-gray-500">{t("common.search")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">{t("common.delete")}</h3>
            <p className="mb-6 text-gray-600">{t("vacancy.confirmDelete")}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded hover:bg-gray-100">
                {t("common.cancel")}
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacanciesPage;
