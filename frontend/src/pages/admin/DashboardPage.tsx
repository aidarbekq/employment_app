import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Download, RefreshCw } from "lucide-react";
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

const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsResponse>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("analytics/employment-stats/");
      setStats(res.data as StatsResponse);
    } catch (error) {
      console.error("Error loading stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const yearEntries = useMemo(
    () =>
      Object.entries(stats)
        .filter(([key, value]) => key !== "meta" && isStatYear(value))
        .sort(([a], [b]) => Number(a) - Number(b)) as Array<[string, StatYear]>,
    [stats]
  );

  const allYears = yearEntries.map(([year]) => year);
  const filteredEntries = selectedYear === "all" ? yearEntries : yearEntries.filter(([year]) => year === selectedYear);

  const total = filteredEntries.reduce((sum, [, value]) => sum + value.total, 0);
  const surveyed = filteredEntries.reduce((sum, [, value]) => sum + value.surveyed, 0);
  const employed = filteredEntries.reduce((sum, [, value]) => sum + value.employed, 0);
  const avgEmploymentRate = surveyed > 0 ? Math.round((employed / surveyed) * 100) : 0;

  const chartData = filteredEntries.map(([year, value]) => ({
    year,
    rate: value.percent_employed,
  }));

  const selectedYearStats = selectedYear !== "all" ? (stats[selectedYear] as StatYear | undefined) : undefined;
  const statusDistribution = selectedYearStats && isStatYear(selectedYearStats)
    ? {
        employed_specialty: selectedYearStats.employed_specialty,
        employed_not_specialty: selectedYearStats.employed_not_specialty,
        self_employed: selectedYearStats.self_employed,
        continuing_education: selectedYearStats.continuing_education,
        unemployed: selectedYearStats.unemployed,
        lost_contact: selectedYearStats.lost_contact,
      }
    : stats.meta?.status_distribution ?? {};

  const pieData = [
    { name: t("graduate.employedSpecialty"), value: statusDistribution.employed_specialty ?? 0 },
    { name: t("graduate.employedNotSpecialty"), value: statusDistribution.employed_not_specialty ?? 0 },
    { name: t("graduate.selfEmployed"), value: statusDistribution.self_employed ?? 0 },
    { name: t("graduate.continuingEducation"), value: statusDistribution.continuing_education ?? 0 },
    { name: t("graduate.unemployed"), value: statusDistribution.unemployed ?? 0 },
    { name: t("graduate.lostContact"), value: statusDistribution.lost_contact ?? 0 },
  ].filter((item) => item.value > 0);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const params: Record<string, string> = {};
      if (selectedYear !== "all") params.graduation_year = selectedYear;
      const res = await api.get("analytics/employment-report.pdf", {
        params,
        responseType: "blob",
      });
      downloadBlob(res.data as Blob, `employment_report_${selectedYear}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF", error);
    } finally {
      setExporting(false);
    }
  };

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
          <select
            className="border text-sm rounded-md p-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">{t("admin.allYears")}</option>
            {allYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={fetchStats}>
            {t("admin.refresh")}
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={handleExportPdf} disabled={exporting}>
            {t("admin.exportPdf")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.employmentRate")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">{avgEmploymentRate}%</div>
            <p className="text-gray-500 text-sm">
              {t("admin.employmentInYear", { year: selectedYear === "all" ? t("admin.allYears") : selectedYear })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.totalGraduates")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl sm:text-4xl font-bold text-secondary-600 mb-2">{total}</div>
            <p className="text-gray-500 text-sm">{t("admin.graduatesInYear", { year: selectedYear === "all" ? t("admin.allYears") : selectedYear })}</p>
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
            <p className="text-gray-500 text-sm">{t("admin.employedInYear", { year: selectedYear === "all" ? t("admin.allYears") : selectedYear })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border rounded-xl shadow p-4 sm:p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">{t("admin.tableTitle")}</h2>
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">{t("admin.year")}</th>
              <th className="px-4 py-2 text-left">{t("admin.totalGraduates")}</th>
              <th className="px-4 py-2 text-left">{t("admin.surveyed")}</th>
              <th className="px-4 py-2 text-left">{t("graduate.employedSpecialty")}</th>
              <th className="px-4 py-2 text-left">{t("graduate.employedNotSpecialty")}</th>
              <th className="px-4 py-2 text-left">{t("graduate.selfEmployed")}</th>
              <th className="px-4 py-2 text-left">{t("graduate.continuingEducation")}</th>
              <th className="px-4 py-2 text-left">{t("admin.unemployed")}</th>
              <th className="px-4 py-2 text-left">{t("admin.percentEmployed")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map(([year, value]) => (
              <tr key={year} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">{year}</td>
                <td className="px-4 py-2 whitespace-nowrap">{value.total}</td>
                <td className="px-4 py-2 whitespace-nowrap">{value.surveyed}</td>
                <td className="px-4 py-2 whitespace-nowrap">{value.employed_specialty}</td>
                <td className="px-4 py-2 whitespace-nowrap">{value.employed_not_specialty}</td>
                <td className="px-4 py-2 whitespace-nowrap">{value.self_employed}</td>
                <td className="px-4 py-2 whitespace-nowrap">{value.continuing_education}</td>
                <td className="px-4 py-2 whitespace-nowrap">{value.unemployed}</td>
                <td className="px-4 py-2 whitespace-nowrap">{value.percent_employed}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.employmentTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number | string) => [`${value}%`, t("admin.employmentRate")]} />
                  <Line type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.statusPieChart")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {pieData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} label>
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
    </div>
  );
};

export default AdminDashboardPage;
