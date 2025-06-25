import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Briefcase,
  Calendar,
  BadgeCheck,
  XCircle,
  User,
  Mail
} from "lucide-react";

const EmployerGraduateDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [graduate, setGraduate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`alumni/alumni-profiles/${id}/`)
      .then((res) => setGraduate(res.data))
      .catch((err) => console.error("Load error:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !graduate) {
    return <p className="text-center mt-10">{t("common.loading")}</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 md:px-0 py-6">
      <h1 className="text-2xl font-bold text-gray-800">
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("employer.profile")}: {graduate.user.first_name} {graduate.user.last_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 text-sm">
          {/* First Name */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <strong>{t("auth.firstName")}:</strong>
            <span>{graduate.user.first_name}</span>
          </div>

          {/* Last Name */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <strong>{t("auth.lastName")}:</strong>
            <span>{graduate.user.last_name}</span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <strong>{t("auth.email")}:</strong>
            <span>{graduate.user.email}</span>
          </div>

          {/* Specialty */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <strong>{t("graduate.specialty")}:</strong>
            <span>{graduate.specialty || "—"}</span>
          </div>

          {/* Graduation Year */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <strong>{t("graduate.graduation_year")}:</strong>
            <span>{graduate.graduation_year || "—"}</span>
          </div>

          {/* Position */}
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <strong>{t("graduate.position")}:</strong>
            <span>{graduate.position || "—"}</span>
          </div>

          {/* Employer ID */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">{t("admin.employerId")}:</span>
            <span>{graduate.employer ?? "—"}</span>
          </div>

          {/* Employment Status */}
          <div className="flex items-center gap-2">
            {graduate.is_employed ? (
              <>
                <BadgeCheck className="w-4 h-4 text-green-600" />
                <span className="text-green-700">{t("graduate.employed")}</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-700">{t("graduate.unemployed")}</span>
              </>
            )}
          </div>

          {/* Resume */}
          {graduate.resume && (
            <div className="flex items-center gap-2 pt-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <a
                href={graduate.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {t("graduate.resume")}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerGraduateDetailPage;
