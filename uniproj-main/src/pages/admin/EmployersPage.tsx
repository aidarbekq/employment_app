import React, { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/services/api";
import Button from "@/components/common/Button";

interface Employer {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  company_name: string;
  address: string;
  phone: string;
  description: string | null;
}

const EmployersPage: React.FC = () => {
  const { t } = useTranslation();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const res = await api.get("employers/employers/");
        setEmployers(res.data);
      } catch (error) {
        console.error("Error loading employers", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployers();
  }, []);

  const filtered = employers.filter((e) => {
    const lower = search.toLowerCase();
    return (
      e.company_name?.toLowerCase().includes(lower) ||
      e.address?.toLowerCase().includes(lower) ||
      e.phone?.toLowerCase().includes(lower) ||
      (e.description?.toLowerCase() || "").includes(lower)
    );
  });

  if (loading)
    return <p className="text-center mt-10 text-gray-500">{t("admin.loadingEmployers")}</p>;

return (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
    <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">
      {t("admin.employersListTitle")}
    </h1>

    <div className="relative w-full sm:max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        placeholder={t("common.search")}
        className="w-full border pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    {/* Desktop Table */}
    <div className="hidden sm:block">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm text-left bg-white">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3">{t("employer.company_name")}</th>
              <th className="px-4 py-3">{t("employer.address")}</th>
              <th className="px-4 py-3">{t("employer.phone")}</th>
              <th className="px-4 py-3">{t("employer.description")}</th>
              <th className="px-4 py-3">{t("common.view")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{e.company_name}</td>
                  <td className="px-4 py-2">{e.address}</td>
                  <td className="px-4 py-2">{e.phone}</td>
                  <td className="px-4 py-2">{e.description || "—"}</td>
                  <td className="px-4 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Eye className="h-4 w-4" />}
                      onClick={() => navigate(`/admin/employers/${e.id}`)}
                    >
                      {t("common.view")}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  {t("common.noResults")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Mobile Cards */}
    <div className="sm:hidden space-y-4">
      {filtered.length > 0 ? (
        filtered.map((e) => (
          <div
            key={e.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-2"
          >
            <div className="text-sm">
              <strong>{t("employer.company_name")}:</strong> {e.company_name}
            </div>
            <div className="text-sm">
              <strong>{t("employer.address")}:</strong> {e.address}
            </div>
            <div className="text-sm">
              <strong>{t("employer.phone")}:</strong> {e.phone}
            </div>
            <div className="text-sm">
              <strong>{t("employer.description")}:</strong>{" "}
              {e.description || "—"}
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Eye className="h-4 w-4" />}
              onClick={() => navigate(`/admin/employers/${e.id}`)}
            >
              {t("common.view")}
            </Button>
          </div>
        ))
      ) : (
        <p className="text-center py-4 text-gray-500">
          {t("common.noResults")}
        </p>
      )}
    </div>
  </div>
);
};

export default EmployersPage;
