import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { getListResults } from '@/utils/pagination';
import { Download, FileText, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface AlumniProfileSummary {
  id: number;
  user: number | { id: number };
  resume: string | null;
}

const ResumePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const res = await api.get('alumni/alumni-profiles/', { params: { page_size: 100 } });
      const myProfile = getListResults<AlumniProfileSummary>(res.data).find((profile) => {
        if (typeof profile.user === 'object') return profile.user.id === user.id;
        return profile.user === user.id;
      });

      if (myProfile) {
        setResumeUrl(myProfile.resume);
        setProfileId(myProfile.id);
        setError(null);
      } else {
        setError(t('resume.notFound'));
      }
    } catch {
      setError(t('resume.loadError'));
    }
  }, [user, t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !profileId) {
      setError(t('resume.noFile'));
      return;
    }

    setError(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      await api.put(`alumni/alumni-profiles/${profileId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(t('resume.uploadSuccess'));
      setFile(null);
      await fetchProfile();
    } catch {
      toast.error(t('resume.uploadError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!profileId) return;

    try {
      await api.put(`alumni/alumni-profiles/${profileId}/`, { resume: null });
      toast.success(t('resume.deleteSuccess'));
      setResumeUrl(null);
      setFile(null);
      setIsDeleteOpen(false);
    } catch {
      toast.error(t('resume.deleteError'));
    }
  };

  const fileName = resumeUrl?.split('/').pop() || t('resume.title');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('resume.title')}
        subtitle={t('resume.formats')}
        icon={<FileText className="h-6 w-6" />}
      />

      {error && (
        <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      <Card className="overflow-hidden rounded-3xl border-gray-100">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border-b border-gray-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              {resumeUrl ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 rounded-3xl border border-primary-100 bg-primary-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm ring-1 ring-primary-100">
                        <FileText className="h-7 w-7" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{fileName}</p>
                        <p className="mt-1 text-xs text-gray-500 break-all">{resumeUrl}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <a href={resumeUrl} download className="w-full sm:w-auto">
                        <Button type="button" size="sm" className="w-full" leftIcon={<Download className="h-4 w-4" />}>
                          {t('resume.download')}
                        </Button>
                      </a>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={() => setIsDeleteOpen(true)}
                      >
                        {t('resume.delete')}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                    <UploadCloud className="mx-auto mb-3 h-10 w-10 text-primary-500" />
                    <p className="text-sm font-semibold text-gray-900">{t('resume.uploadPrompt')}</p>
                    <p className="mt-1 text-xs text-gray-500">{t('resume.formats')}</p>
                    <label htmlFor="file-upload" className="mt-4 inline-flex cursor-pointer">
                      <span className="rounded-xl border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50">
                        {t('resume.selectFile')}
                      </span>
                      <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border-2 border-dashed border-primary-200 bg-primary-50/60 p-8 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-primary-700 shadow-sm ring-1 ring-primary-100">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{t('resume.uploadPrompt')}</p>
                  <p className="mt-2 text-sm text-gray-500">{t('resume.formats')}</p>

                  <label htmlFor="file-upload" className="mt-5 inline-flex cursor-pointer">
                    <span className="rounded-xl border border-primary-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50">
                      {t('resume.selectFile')}
                    </span>
                    <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                  </label>
                </div>
              )}

              {file && (
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-primary-600" />
                    <span className="truncate text-sm font-medium text-gray-800">{file.name}</span>
                  </div>
                  <Button onClick={handleUpload} isLoading={isUploading} disabled={isUploading} leftIcon={<UploadCloud className="h-4 w-4" />}>
                    {isUploading ? t('resume.uploading') : t('resume.upload')}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-gray-50/70 p-6 sm:p-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('resume.tipsTitle')}</h2>
              <div className="space-y-3">
                {[t('resume.tipOne'), t('resume.tipTwo'), t('resume.tipThree'), t('resume.tipFour')].map((tip) => (
                  <div key={tip} className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-6 text-gray-600 shadow-sm ring-1 ring-gray-100">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isDeleteOpen}
        title={t('resume.delete')}
        description={t('resume.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        danger
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default ResumePage;
