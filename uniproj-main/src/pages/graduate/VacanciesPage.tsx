import React, { useEffect, useState } from "react";
import {
  Briefcase, Calendar, CheckCircle, XCircle,
  Search, MapPin, Eye
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import api from "@/services/api";
import Button from "@/components/common/Button";

interface Vacancy {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: string;
  is_active: boolean;
  created_at: string;
  employer: {
    company_name: string;
  };
}

const GraduateVacanciesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<"" | "true" | "false">("");
  const [createdSort, setCreatedSort] = useState<"" | "asc" | "desc">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("vacancies/vacancies/");
        setVacancies(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = vacancies.filter((v) => {
    const matchesSearch = [v.title, v.location, v.employer?.company_name]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()));
    const matchesActive =
      isActiveFilter === "" || String(v.is_active) === isActiveFilter;
    return matchesSearch && matchesActive;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (createdSort === "asc") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (createdSort === "desc") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800"></h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("vacancy.vacanciesList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="relative w-full lg:w-96">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("common.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md"
              />
            </div>

            <select
              className="border border-gray-300 rounded-md py-2 px-3 w-full lg:w-56"
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value as any)}
            >
              <option value="">{t("common.filter")} - {t("vacancy.status")}</option>
              <option value="true">{t("vacancy.active")}</option>
              <option value="false">{t("vacancy.inactive")}</option>
            </select>

            <select
              className="border border-gray-300 rounded-md py-2 px-3 w-full lg:w-56"
              value={createdSort}
              onChange={(e) => setCreatedSort(e.target.value as any)}
            >
              <option value="">{t("vacancy.createdAt")}: {t("common.all")}</option>
              <option value="desc">{t("common.newestFirst")}</option>
              <option value="asc">{t("common.oldestFirst")}</option>
            </select>
          </div>

          <div className="space-y-4">
            {sorted.map((v) => (
              <div
                key={v.id}
                className="border border-gray-200 rounded-lg bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex justify-between flex-col md:flex-row gap-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-gray-700" />
                    <div>
                      <h3 className="font-medium text-gray-900">{v.title}</h3>
                      <p className="text-sm text-gray-500">{v.employer?.company_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        v.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {v.is_active ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t("vacancy.active")}
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          {t("vacancy.inactive")}
                        </>
                      )}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/graduate/vacancies/${v.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("common.view")}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{t("vacancy.location")}</h4>
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      {v.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{t("vacancy.salary")}</h4>
                    <p>${v.salary || t("common.notSpecified")}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{t("vacancy.createdAt")}</h4>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {new Date(v.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{t("vacancy.description")}</h4>
                    <p className="line-clamp-3">{v.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!sorted.length && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("vacancy.noResults")}</h3>
              <p className="text-gray-500">{t("common.tryAdjustingFilters")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GraduateVacanciesPage;
