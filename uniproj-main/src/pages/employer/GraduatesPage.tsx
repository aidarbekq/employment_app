import React, { useEffect, useState } from "react";
import {
  GraduationCap, Search, BadgeCheck, Briefcase, XCircle,
  Calendar, FileText, Eye
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import api from "@/services/api";

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

const EmployerGraduatesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchGraduates = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (yearFilter) params.graduation_year = yearFilter;
      if (employmentFilter) params.is_employed = employmentFilter;
      if (search) params.search = search;

      const res = await api.get("alumni/alumni-profiles/", { params });
      const filtered = res.data.filter((g: Graduate) => g.user?.role === "ALUMNI");
      setGraduates(filtered);
    } catch (err) {
      console.error("Failed to load graduates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraduates();
  }, [search, yearFilter, employmentFilter]);

  return (
    <div className="space-y-6 px-4 md:px-10 py-6">
      <h1 className="text-2xl font-semibold text-gray-800">
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.graduatesListTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-6">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={t("common.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <select
              className="border rounded px-3 py-2 w-full md:w-48"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">{t("admin.yearFilter")}</option>
              {[2025, 2024, 2023, 2022, 2021].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              className="border rounded px-3 py-2 w-full md:w-48"
              value={employmentFilter}
              onChange={(e) => setEmploymentFilter(e.target.value)}
            >
              <option value="">{t("graduate.employmentStatus")}</option>
              <option value="true">{t("graduate.employed")}</option>
              <option value="false">{t("graduate.unemployed")}</option>
            </select>
          </div>

          <div className="space-y-4">
            {graduates.map((g) => (
              <div
                key={g.id}
                className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <GraduationCap className="text-blue-600 h-6 w-6" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {g.user.first_name} {g.user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{g.specialty}</div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Eye className="w-4 h-4" />}
                    onClick={() => navigate(`/employer/graduates/${g.id}`)}
                  >
                    {t("common.view")}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700 pl-1 sm:pl-10">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {g.graduation_year}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                    {g.position || "—"}
                  </div>
                  <div className="flex items-center">
                    {g.is_employed ? (
                      <>
                        <BadgeCheck className="h-4 w-4 mr-1 text-green-600" />
                        <span className="text-green-700 font-medium">{t("graduate.employed")}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1 text-yellow-600" />
                        <span className="text-yellow-700 font-medium">{t("graduate.unemployed")}</span>
                      </>
                    )}
                  </div>
                  {g.resume && (
                    <a
                      href={g.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      {t("graduate.resume")}
                    </a>
                  )}
                </div>
              </div>
            ))}
            {!graduates.length && !loading && (
              <div className="text-center py-12 text-gray-500">
                {t("common.noResults")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerGraduatesPage;
