import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  ClipboardList,
  CheckCircle,
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

const GraduateVacancyDetailPage: React.FC = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`vacancies/vacancies/${id}/`);
        setVacancy(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      await api.post("vacancies/apply/", { vacancy_id: id });
      setApplied(true);
    } catch {
      alert(t("vacancy.errorApply"));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-6 text-gray-500">{t("common.loading")}</p>;
  }

  if (!vacancy) {
    return <p className="text-center mt-6 text-red-600">{t("vacancy.errorLoad")}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">
        
      </h1>

      <Card>
          <CardHeader>
          <CardTitle>{t("vacancy.title")}: {vacancy.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">{t("employer.company_name")}</h4>
              <p className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                {vacancy.employer?.company_name}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-1">{t("vacancy.location")}</h4>
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                {vacancy.location}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-1">{t("vacancy.salary")}</h4>
              <p className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                {vacancy.salary || t("common.notSpecified")}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-1">{t("vacancy.createdAt")}</h4>
              <p className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                {new Date(vacancy.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-1">{t("vacancy.description")}</h4>
            <p>{vacancy.description}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-1">{t("vacancy.requirements")}</h4>
            <p className="flex items-start">
              <ClipboardList className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
              {vacancy.requirements || "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        {applied ? (
          <p className="inline-flex items-center text-green-600 font-medium">
            <CheckCircle className="h-5 w-5 mr-1" /> {t("vacancy.applied")}
          </p>
        ) : (
          <Button onClick={handleApply} disabled={applying}>
            {applying ? t("vacancy.applying") : t("vacancy.apply")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GraduateVacancyDetailPage;
