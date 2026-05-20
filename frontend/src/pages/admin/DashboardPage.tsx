import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Download, FilterX, RefreshCw } from "lucide-react";
import api from "@/services/api";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface StatYear {
  total: number;
  surveyed: number;
  employed: number;
  unemployed: number;
  employed_specialty: number;
  employed_not_specialty: number;
  self_employed: number;
  continuing_education: number;
  lost_contact: number;
  percent_employed: number;
  percent_employed_specialty: number;
  percent_employed_not_specialty: number;
  percent_self_employed: number;
  percent_continuing_education: number;
  percent_unemployed: number;
}

interface StatsMeta {
  total_employers?: number;
  status_distribution?: Record<string, number>;
}

type StatsResponse = Record<string, StatYear | StatsMeta | undefined> & { meta?: StatsMeta };

interface AcademicGroup {
  id: number;
  name: string;
  graduation_year: number | null;
  direction_code: string;
  direction_name: string;
  profile: string;
  study_form: string;
  study_form_display?: string;
  degree_level: string;
  degree_level_display?: string;
  is_active: boolean;
}

type ReportFilters = {
  graduation_year: string;
  academic_group: string;
  direction_code: string;
  study_form: string;
  degree_level: string;
  employment_status: string;
};

const EMPTY_FILTERS: ReportFilters = {
  graduation_year: "",
  academic_group: "",
  direction_code: "",
  study_form: "",
  degree_level: "",
  employment_status: "",
};

const STATUS_COLORS = ["#2563EB", "#60A5FA", "#22C55E", "#FACC15", "#EF4444", "#6B7280"];

const isStatYear = (value: StatYear | StatsMeta | undefined): value is StatYear =>
  Boolean(value && "total" in value && "employed" in value);

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

const buildCleanParams = (filters: ReportFilters) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => Boolean(value))
  ) as Record<string, string>;

const sortYearLabel = (a: string, b: string) => {
  const aNumber = Number(a);
  const bNumber = Number(b);
  if (Number.isNaN(aNumber) && Number.isNaN(bNumber)) return a.localeCompare(b);
  if (Number.isNaN(aNumber)) return 1;
  if (Number.isNaN(bNumber)) return -1;
  return aNumber - bNumber;
};

const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsResponse>({});
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>(EMPTY_FILTERS);

  const params = useMemo(() => buildCleanParams(filters), [filters]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("analytics/employment-stats/", { params });
      setStats(res.data as StatsResponse);
    } catch (error) {
      console.error("Error loading stats", error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    api
      .get("alumni/academic-groups/")
      .then((res) => setGroups(res.data as AcademicGroup[]))
      .catch((error) => console.error("Error loading groups", error));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const yearEntries = useMemo(
    () =>
      Object.entries(stats)
        .filter(([key, value]) => key !== "meta" && isStatYear(value))
        .sort(([a], [b]) => sortYearLabel(a, b)) as Array<[string, StatYear]>,
    [stats]
  );

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    groups.forEach((group) => {
      if (group.graduation_year) years.add(String(group.graduation_year));
    });
    yearEntries.forEach(([year]) => years.add(year));
    return Array.from(years).sort(sortYearLabel).reverse();
  }, [groups, yearEntries]);

  const directionOptions = useMemo(() => {
    const directions = new Map<string, string>();
    groups.forEach((group) => {
      if (group.direction_code) {
        directions.set(group.direction_code, `${group.direction_code} — ${group.direction_name}`);
      }
    });
    return Array.from(directions.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [groups]);

  const total = yearEntries.reduce((sum, [, value]) => sum + value.total, 0);
  const surveyed = yearEntries.reduce((sum, [, value]) => sum + value.surveyed, 0);
  const employed = yearEntries.reduce((sum, [, value]) => sum + value.employed, 0);
  const avgEmploymentRate = surveyed > 0 ? Math.round((employed / surveyed) * 100) : 0;

  const chartData = yearEntries.map(([year, value]) => ({
    year,
    rate: value.percent_employed,
    employed: value.employed,
    surveyed: value.surveyed,
  }));

  const statusDistribution = stats.meta?.status_distribution ?? {};
  const pieData = [
    { name: t("graduate.employedSpecialty"), value: statusDistribution.employed_specialty ?? 0 },
    { name: t("graduate.employedNotSpecialty"), value: statusDistribution.employed_not_specialty ?? 0 },
    { name: t("graduate.selfEmployed"), value: statusDistribution.self_employed ?? 0 },
    { name: t("graduate.continuingEducation"), value: statusDistribution.continuing_education ?? 0 },
    { name: t("graduate.unemployed"), value: statusDistribution.unemployed ?? 0 },
    { name: t("graduate.lostContact"), value: statusDistribution.lost_contact ?? 0 },
  ].filter((item) => item.value > 0);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const handleFilterChange = (name: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const res = await api.get("analytics/employment-report.pdf", {
        params,
        responseType: "blob",
      });
      const suffix = filters.graduation_year || filters.academic_group || filters.direction_code || "all";
      downloadBlob(res.data as Blob, `employment_report_${suffix}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF", error);
    } finally {
      setExporting(false);
    }
  };

  const statusCell = (count: number, percent: number) => (
    <div className="min-w-[120px]">
      <div className="flex items-center justify-between gap-2 text-xs text-gray-600 mb-1">
        <span className="font-medium text-gray-800">{count}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );

  if (loading) {
    return <p className="text-center mt-8 text-gray-500">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{t("admin.dashboard")}</h1>
          <p className="text-gray-500 text-sm">{t("admin.overview")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={fetchStats}>
            {t("admin.refresh")}
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={handleExportPdf} disabled={exporting}>
            {t("admin.exportPdf")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("admin.reportFilters")}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{t("admin.reportFiltersHint")}</p>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" leftIcon={<FilterX className="h-4 w-4" />} onClick={resetFilters}>
              {t("admin.resetFilters")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <select className="border rounded-md px-3 py-2 text-sm" value={filters.graduation_year} onChange={(e) => handleFilterChange("graduation_year", e.target.value)}>
              <option value="">{t("admin.allYears")}</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select className="border rounded-md px-3 py-2 text-sm" value={filters.academic_group} onChange={(e) => handleFilterChange("academic_group", e.target.value)}>
              <option value="">{t("admin.allGroups")}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>

            <select className="border rounded-md px-3 py-2 text-sm" value={filters.direction_code} onChange={(e) => handleFilterChange("direction_code", e.target.value)}>
              <option value="">{t("admin.allDirections")}</option>
              {directionOptions.map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>

            <select className="border rounded-md px-3 py-2 text-sm" value={filters.study_form} onChange={(e) => handleFilterChange("study_form", e.target.value)}>
              <option value="">{t("admin.allStudyForms")}</option>
              <option value="FULL_TIME">{t("graduate.fullTime")}</option>
              <option value="PART_TIME">{t("graduate.partTime")}</option>
            </select>

            <select className="border rounded-md px-3 py-2 text-sm" value={filters.degree_level} onChange={(e) => handleFilterChange("degree_level", e.target.value)}>
              <option value="">{t("admin.allDegreeLevels")}</option>
              <option value="BACHELOR">{t("graduate.bachelor")}</option>
              <option value="MASTER">{t("graduate.master")}</option>
            </select>

            <select className="border rounded-md px-3 py-2 text-sm" value={filters.employment_status} onChange={(e) => handleFilterChange("employment_status", e.target.value)}>
              <option value="">{t("admin.allStatuses")}</option>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{t("admin.employmentRate")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">{avgEmploymentRate}%</div>
            <p className="text-gray-500 text-sm">{t("admin.filteredReportHint")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.totalGraduates")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl sm:text-4xl font-bold text-secondary-600 mb-2">{total}</div>
            <p className="text-gray-500 text-sm">{t("admin.totalGraduatesHint")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.surveyed")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">{surveyed}</div>
            <p className="text-gray-500 text-sm">{t("admin.surveyedHint")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.employed")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">{employed}</div>
            <p className="text-gray-500 text-sm">{t("admin.employedHint")}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t("admin.tableTitle")}</CardTitle>
          <p className="text-sm text-gray-500 mt-1">{t("admin.tableSubtitle")}</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">{t("admin.year")}</th>
                  <th className="px-6 py-3 text-left">{t("admin.totalGraduates")}</th>
                  <th className="px-6 py-3 text-left">{t("admin.surveyed")}</th>
                  <th className="px-6 py-3 text-left">{t("graduate.employedSpecialty")}</th>
                  <th className="px-6 py-3 text-left">{t("graduate.employedNotSpecialty")}</th>
                  <th className="px-6 py-3 text-left">{t("graduate.selfEmployed")}</th>
                  <th className="px-6 py-3 text-left">{t("graduate.continuingEducation")}</th>
                  <th className="px-6 py-3 text-left">{t("admin.unemployed")}</th>
                  <th className="px-6 py-3 text-left">{t("admin.percentEmployed")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {yearEntries.map(([year, value]) => (
                  <tr key={year} className="hover:bg-primary-50/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{value.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{value.surveyed}</td>
                    <td className="px-6 py-4">{statusCell(value.employed_specialty, value.percent_employed_specialty)}</td>
                    <td className="px-6 py-4">{statusCell(value.employed_not_specialty, value.percent_employed_not_specialty)}</td>
                    <td className="px-6 py-4">{statusCell(value.self_employed, value.percent_self_employed)}</td>
                    <td className="px-6 py-4">{statusCell(value.continuing_education, value.percent_continuing_education)}</td>
                    <td className="px-6 py-4">{statusCell(value.unemployed, value.percent_unemployed)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-primary-700 font-semibold">
                        {value.percent_employed}%
                      </span>
                    </td>
                  </tr>
                ))}
                {!yearEntries.length && (
                  <tr>
                    <td className="px-6 py-10 text-center text-gray-500" colSpan={9}>{t("common.noResults")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.employmentTrend")}</CardTitle>
          <p className="text-sm text-gray-500 mt-1">{t("admin.employmentTrendHint")}</p>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: number | string, name: string) => [name === "rate" ? `${value}%` : value, name === "rate" ? t("admin.employmentRate") : t("admin.employed")]}
                    labelFormatter={(label) => `${t("admin.year")}: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="rate" name={t("admin.employmentRate")} stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">{t("common.noResults")}</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.statusPieChart")}</CardTitle>
          <p className="text-sm text-gray-500 mt-1">{t("admin.statusPieChartHint")}</p>
        </CardHeader>
        <CardContent>
          <div className="h-[420px]">
            {pieData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={80} outerRadius={140} paddingAngle={2} label>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">{t("common.noResults")}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
