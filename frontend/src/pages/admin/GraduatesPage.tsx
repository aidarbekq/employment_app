import React, { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import api from "@/services/api";

interface AcademicGroup {
  id: number;
  name: string;
}

interface Graduate {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  academic_group: AcademicGroup | null;
  graduation_year: number | null;
  specialty: string | null;
  direction: string | null;
  profile: string | null;
  study_form: string | null;
  employment_status: string;
  employment_status_display?: string;
  is_employed: boolean;
  employer: number | null;
  workplace: string | null;
  position: string | null;
  resume: string | null;
}

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const AdminGraduatesPage: React.FC = () => {
  const { t } = useTranslation();
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  const buildParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (yearFilter) params.graduation_year = yearFilter;
    if (groupFilter) params.academic_group = groupFilter;
    if (statusFilter) params.employment_status = statusFilter;
    if (search) params.search = search;
    return params;
  }, [groupFilter, search, statusFilter, yearFilter]);

  const fetchGraduates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("alumni/alumni-profiles/", { params: buildParams() });
      const filtered = (res.data as Graduate[]).filter((graduate) => graduate.user?.role === "ALUMNI");
      setGraduates(filtered);
    } catch (err) {
      console.error("Ошибка при загрузке выпускников", err);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    api
      .get("alumni/academic-groups/")
      .then((res) => setGroups(res.data as AcademicGroup[]))
      .catch((err) => console.error("Ошибка при загрузке групп", err));
  }, []);

  useEffect(() => {
    fetchGraduates();
  }, [fetchGraduates]);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const res = await api.get("analytics/employment-report.pdf", {
        params: buildParams(),
        responseType: "blob",
      });
      downloadBlob(res.data as Blob, "employment_report.pdf");
    } catch (error) {
      console.error("Ошибка при экспорте PDF", error);
    } finally {
      setExporting(false);
    }
  };

  const statusLabel = (graduate: Graduate) => graduate.employment_status_display || graduate.employment_status || "—";

  return (
    <div className="space-y-6 px-4 md:px-10 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{t("admin.graduatesListTitle")}</h1>
          <p className="text-sm text-gray-500">{t("admin.graduatesListHint")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportPdf} disabled={exporting}>
            {t("admin.exportPdf")}
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate("/admin/graduates/create")}>
            {t("admin.addGraduate")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={t("common.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <select className="border rounded px-3 py-2 w-full" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              <option value="">{t("admin.yearFilter")}</option>
              {[2026, 2025, 2024, 2023, 2022, 2021].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select className="border rounded px-3 py-2 w-full" value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
              <option value="">{t("graduate.group")}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>

            <select className="border rounded px-3 py-2 w-full" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">{t("graduate.employmentStatus")}</option>
              <option value="EMPLOYED_SPECIALTY">{t("graduate.employedSpecialty")}</option>
              <option value="EMPLOYED_NOT_SPECIALTY">{t("graduate.employedNotSpecialty")}</option>
              <option value="SELF_EMPLOYED">{t("graduate.selfEmployed")}</option>
              <option value="CONTINUING_EDUCATION">{t("graduate.continuingEducation")}</option>
              <option value="UNEMPLOYED">{t("graduate.unemployed")}</option>
              <option value="LOST_CONTACT">{t("graduate.lostContact")}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="space-y-4">
            {graduates.map((graduate) => (
              <div key={graduate.id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <GraduationCap className="text-blue-600 h-6 w-6" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {graduate.user.first_name} {graduate.user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {graduate.academic_group?.name || "—"} · {graduate.profile || graduate.specialty || "—"}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" leftIcon={<Eye className="w-4 h-4" />} onClick={() => navigate(`/admin/graduates/${graduate.id}`)}>
                    {t("common.view")}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700 pl-1 sm:pl-10">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {graduate.graduation_year || "—"}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                    {graduate.position || graduate.workplace || "—"}
                  </div>
                  <div className="flex items-center">
                    {graduate.is_employed ? (
                      <BadgeCheck className="h-4 w-4 mr-1 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1 text-yellow-600" />
                    )}
                    <span className={graduate.is_employed ? "text-green-700 font-medium" : "text-yellow-700 font-medium"}>
                      {statusLabel(graduate)}
                    </span>
                  </div>
                  {graduate.resume && (
                    <a href={graduate.resume} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                      <FileText className="w-4 h-4 mr-1" />
                      {t("graduate.resume")}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {!graduates.length && !loading && <div className="text-center py-12 text-gray-500">{t("common.noResults")}</div>}
            {loading && <div className="text-center py-12 text-gray-500">{t("common.loading")}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGraduatesPage;
