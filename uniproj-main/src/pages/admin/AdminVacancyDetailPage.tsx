import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  MapPin,
  Pencil,
  Trash,
} from "lucide-react";

import api from "@/services/api";
import Button from "@/components/common/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/Card";

interface Vacancy {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  is_active: boolean;
  created_at: string;
  employer: {
    id: number;
    company_name: string;
  };
}

const AdminVacancyDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const res = await api.get(`vacancies/vacancies/${id}/`);
        setVacancy(res.data);
      } catch {
        toast.error(t("vacancy.errorLoad"));
      } finally {
        setLoading(false);
      }
    };
    fetchVacancy();
  }, [id, t]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`vacancies/vacancies/${id}/`);
      toast.success(t("vacancy.successDelete"));
      navigate("/admin/vacancies");
    } catch {
      toast.error(t("vacancy.errorDelete"));
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-6 text-gray-500">{t("common.loading")}</p>;
  }

  if (!vacancy) {
    return <p className="text-center mt-6 text-red-600">{t("vacancy.errorLoad")}</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          {t("vacancy.title")}: {vacancy.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate(`/admin/vacancies/${vacancy.id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" />
            {t("common.edit")}
          </Button>
          <Button variant="destructive" onClick={() => setShowConfirm(true)}>
            <Trash className="h-4 w-4 mr-1" />
            {t("common.delete")}
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/vacancies")}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>

      {/* Vacancy Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("vacancy.editFormTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-gray-900 font-medium mb-1">{t("employer.company_name")}</h4>
              <p className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                {vacancy.employer?.company_name}
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 font-medium mb-1">{t("vacancy.location")}</h4>
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                {vacancy.location}
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 font-medium mb-1">{t("vacancy.salary")}</h4>
              <p>${vacancy.salary || t("common.notSpecified")}</p>
            </div>
            <div>
              <h4 className="text-gray-900 font-medium mb-1">{t("vacancy.createdAt")}</h4>
              <p className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                {new Date(vacancy.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-gray-900 font-medium mb-1">{t("vacancy.description")}</h4>
            <p>{vacancy.description}</p>
          </div>

          <div>
            <h4 className="text-gray-900 font-medium mb-1">{t("vacancy.requirements")}</h4>
            <p>{vacancy.requirements || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("common.confirmDelete")}</h2>
            <p className="text-gray-700">
              {t("vacancy.confirmDelete", { title: vacancy.title })}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                {t("common.cancel")}
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? t("vacancy.updating") : t("common.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVacancyDetailPage;
