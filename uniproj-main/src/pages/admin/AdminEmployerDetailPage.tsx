// src/pages/admin/AdminEmployerDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Loader2, Trash2, Save, ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Employer {
  id: number;
  user: string;
  company_name: string;
  address: string;
  phone: string;
  description: string;
}

const AdminEmployerDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`employers/employers/${id}/`);
        setEmployer(res.data);
      } catch {
        setError(t("common.error"));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!employer) return;
    setEmployer({ ...employer, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!employer) return;
    setSaving(true);
    try {
      await api.put(`employers/employers/${employer.id}/`, employer);
      toast.success(t("common.success"));
      setIsEditing(false);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!employer) return;
    setDeleting(true);
    try {
      await api.delete(`employers/employers/${employer.id}/`);
      toast.success(t("admin.employersManagement") + ": " + t("common.success"));
      navigate("/admin/employers");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">{t("common.loading")}</p>;

  if (error || !employer)
    return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {t("admin.employersManagement")}
      </h1>

      <div className="space-y-4">
        <Input
          label={t("employer.company_name")}
          name="company_name"
          value={employer.company_name}
          onChange={handleChange}
          disabled={!isEditing}
        />
        <Input
          label={t("employer.address")}
          name="address"
          value={employer.address}
          onChange={handleChange}
          disabled={!isEditing}
        />
        <Input
          label={t("employer.phone")}
          name="phone"
          value={employer.phone}
          onChange={handleChange}
          disabled={!isEditing}
        />
        <Input
          label={t("employer.description")}
          name="description"
          value={employer.description}
          onChange={handleChange}
          disabled={!isEditing}
        />
      </div>

      <div className="pt-8 flex flex-col sm:flex-row sm:justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/employers")}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.back")}
        </Button>

        <Button
          variant="danger"
          onClick={() => setShowConfirm(true)}
          leftIcon={<Trash2 />}
          className="w-full sm:w-auto"
        >
          {t("common.delete")}
        </Button>

        {!isEditing ? (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            leftIcon={<Pencil />}
            className="w-full sm:w-auto"
          >
            {t("common.edit")}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleUpdate}
            leftIcon={saving ? <Loader2 className="animate-spin" /> : <Save />}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {t("common.save")}
          </Button>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("common.confirmDelete")}</h2>
            <p className="text-gray-700">
              {t("admin.confirmDeleteEmployer", { name: employer.company_name })}
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? t("vacancy.updating") : t("common.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployerDetailPage;
