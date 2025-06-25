import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/Card";
import Button from "@/components/common/Button";
import { RefreshCw, FileText } from "lucide-react";
import api from "@/services/api";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";

interface StatYear {
  total: number;
  employed: number;
  unemployed: number;
  percent_employed: number;
}

const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Record<string, StatYear>>({});
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("analytics/employment-stats/");
        setStats(res.data);
      } catch (error) {
        console.error("Error loading stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const allYears = Object.keys(stats).filter((y) => y !== "null");
  const filteredYears = selectedYear === "all" ? allYears : [selectedYear];

  const total = filteredYears.reduce((sum, y) => sum + (stats[y]?.total ?? 0), 0);
  const employed = filteredYears.reduce((sum, y) => sum + (stats[y]?.employed ?? 0), 0);
  const avgEmploymentRate = total > 0 ? Math.round((employed / total) * 100) : 0;

  const chartData = filteredYears.map((year) => ({
    year,
    rate: stats[year].percent_employed,
  }));

  const handleExport = () => {
    const data = filteredYears.map((year) => ({
      [t("admin.year")]: year,
      [t("admin.totalGraduates")]: stats[year].total,
      [t("admin.employed")]: stats[year].employed,
      [t("admin.unemployed")]: stats[year].unemployed,
      [t("admin.percentEmployed")]: `${stats[year].percent_employed}%`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t("admin.statistics"));
    XLSX.writeFile(workbook, "employment_stats.xlsx");
  };

  if (loading) {
    return <p className="text-center mt-8 text-gray-500">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {t("admin.dashboard")}
          </h1>
          <p className="text-gray-500 text-sm">{t("admin.overview")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="border text-sm rounded-md p-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">{t("admin.allYears")}</option>
            {allYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => window.location.reload()}
          >
            {t("admin.refresh")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileText className="h-4 w-4" />}
            onClick={handleExport}
          >
            {t("admin.exportReport")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.employmentRate")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">
              {avgEmploymentRate}%
            </div>
            <p className="text-gray-500 text-sm">
              {t("admin.employmentInYear", {
                year: selectedYear === "all" ? t("admin.allYears") : selectedYear,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.totalGraduates")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl sm:text-4xl font-bold text-secondary-600 mb-2">
              {total}
            </div>
            <p className="text-gray-500 text-sm">
              {t("admin.graduatesInYear", {
                year: selectedYear === "all" ? t("admin.allYears") : selectedYear,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.employed")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
              {employed}
            </div>
            <p className="text-gray-500 text-sm">
              {t("admin.employedInYear", {
                year: selectedYear === "all" ? t("admin.allYears") : selectedYear,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow p-4 sm:p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">
          {t("admin.tableTitle")}
        </h2>
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">{t("admin.year")}</th>
              <th className="px-4 py-2 text-left">{t("admin.totalGraduates")}</th>
              <th className="px-4 py-2 text-left">{t("admin.employed")}</th>
              <th className="px-4 py-2 text-left">{t("admin.unemployed")}</th>
              <th className="px-4 py-2 text-left">{t("admin.percentEmployed")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredYears.map((year) => (
              <tr key={year} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">{year}</td>
                <td className="px-4 py-2 whitespace-nowrap">{stats[year].total}</td>
                <td className="px-4 py-2 whitespace-nowrap">{stats[year].employed}</td>
                <td className="px-4 py-2 whitespace-nowrap">{stats[year].unemployed}</td>
                <td className="px-4 py-2 whitespace-nowrap">{stats[year].percent_employed}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div className="grid grid-cols-1 gap-6">
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
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: any) => [`${v}%`, t("admin.employmentRate")]} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#2563EB"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
