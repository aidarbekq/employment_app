import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { Upload, File, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const ResumePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("alumni/alumni-profiles/");
        const myProfile = res.data.find((p: any) => {
          if (typeof p.user === "object") return p.user.id === user?.id;
          return p.user === user?.id;
        });

        if (myProfile) {
          setResumeUrl(myProfile.resume);
          setProfileId(myProfile.id);
        } else {
          setError(t("resume.notFound"));
        }
      } catch {
        setError(t("resume.loadError"));
      }
    };

    if (user) fetchProfile();
  }, [user, t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !profileId) {
      setError(t("resume.noFile"));
      return;
    }

    setError(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      await api.put(`alumni/alumni-profiles/${profileId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("resume.uploadSuccess"));
      setFile(null);
      setResumeUrl(URL.createObjectURL(file)); // fake URL
    } catch {
      toast.error(t("resume.uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!profileId) return;

    try {
      await api.put(`alumni/alumni-profiles/${profileId}/`, { resume: null });
      toast.success(t("resume.deleteSuccess"));
      setResumeUrl(null);
    } catch {
      toast.error(t("resume.deleteError"));
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 sm:p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-blue-800">{t("resume.title")}</h1>

      {error && <p className="text-red-600">{error}</p>}

      {resumeUrl ? (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <File className="h-6 w-6 text-blue-500" />
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-700 hover:text-blue-900 break-all"
              >
                {resumeUrl.split("/").pop()}
              </a>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <a href={resumeUrl} download>
                <button className="flex items-center gap-1 px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  <Download className="w-4 h-4" />
                  {t("resume.download")}
                </button>
              </a>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                {t("resume.delete")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">{t("resume.uploadPrompt")}</p>
          <p className="text-sm text-gray-500 mb-4">{t("resume.formats")}</p>

          <label htmlFor="file-upload" className="cursor-pointer inline-block">
            <div className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50">
              {t("resume.selectFile")}
            </div>
            <input
              id="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
          </label>

          {file && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-700">{file.name}</p>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {isUploading ? t("resume.uploading") : t("resume.upload")}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="pt-6 border-t border-gray-200">
        <h2 className="font-medium text-gray-800 mb-3">{t("resume.tipsTitle")}</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
          <li>{t("resume.tipOne")}</li>
          <li>{t("resume.tipTwo")}</li>
          <li>{t("resume.tipThree")}</li>
          <li>{t("resume.tipFour")}</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumePage;
