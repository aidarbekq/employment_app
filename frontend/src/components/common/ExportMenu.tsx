import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';

export type ExportFormat = 'pdf' | 'docx' | 'xlsx';
export type ReportLanguage = 'ru' | 'en' | 'kg';

interface ExportMenuProps {
  onSelect: (format: ExportFormat, language: ReportLanguage) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const normalizeReportLanguage = (language?: string): ReportLanguage => {
  const normalized = (language || '').toLowerCase();
  if (normalized.startsWith('en')) return 'en';
  if (normalized.startsWith('kg') || normalized.startsWith('ky')) return 'kg';
  return 'ru';
};

const languageOptions: Array<{
  value: ReportLanguage;
  labelKey: string;
  shortLabel: string;
}> = [
  { value: 'ru', labelKey: 'admin.reportLanguageRu', shortLabel: 'RU' },
  { value: 'en', labelKey: 'admin.reportLanguageEn', shortLabel: 'EN' },
  { value: 'kg', labelKey: 'admin.reportLanguageKg', shortLabel: 'KG' },
];

const formatOptions: Array<{
  value: ExportFormat;
  icon: React.ReactNode;
  labelKey: string;
  descriptionKey: string;
}> = [
  {
    value: 'pdf',
    icon: <FileText className="h-4 w-4" />,
    labelKey: 'admin.exportFormatPdf',
    descriptionKey: 'admin.exportFormatPdfHint',
  },
  {
    value: 'docx',
    icon: <FileText className="h-4 w-4" />,
    labelKey: 'admin.exportFormatDocx',
    descriptionKey: 'admin.exportFormatDocxHint',
  },
  {
    value: 'xlsx',
    icon: <FileSpreadsheet className="h-4 w-4" />,
    labelKey: 'admin.exportFormatXlsx',
    descriptionKey: 'admin.exportFormatXlsxHint',
  },
];

const ExportMenu: React.FC<ExportMenuProps> = ({ onSelect, isLoading = false, disabled = false, className }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<ReportLanguage>(() => normalizeReportLanguage(i18n.language));
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedLanguage(normalizeReportLanguage(i18n.language));
  }, [i18n.language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (format: ExportFormat) => {
    setIsOpen(false);
    onSelect(format, selectedLanguage);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full sm:w-auto ${className || ''}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        leftIcon={<Download className="h-4 w-4" />}
        rightIcon={<ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        isLoading={isLoading}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="w-full sm:w-auto"
      >
        {isLoading ? t('admin.exportingReport') : t('admin.exportReport')}
      </Button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-900/12 ring-1 ring-black/5"
        >
          <div className="border-b border-gray-100 bg-gradient-to-br from-primary-50 via-white to-white px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{t('admin.chooseExportFormat')}</p>
            <p className="mt-0.5 text-xs leading-5 text-gray-500">{t('admin.chooseExportFormatHint')}</p>
          </div>

          <div className="border-b border-gray-100 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('admin.reportLanguage')}</p>
              <p className="text-xs text-gray-400">{t('admin.reportLanguageHint')}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {languageOptions.map((option) => {
                const isSelected = selectedLanguage === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-primary-200 bg-primary-600 text-white shadow-md shadow-primary-600/20'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700'
                    }`}
                    onClick={() => setSelectedLanguage(option.value)}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                    <span>{option.shortLabel}</span>
                    <span className="sr-only">{t(option.labelKey)}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              {t('admin.reportLanguageDescription', {
                language: t(languageOptions.find((option) => option.value === selectedLanguage)?.labelKey || 'admin.reportLanguageRu'),
              })}
            </p>
          </div>

          <div className="p-2">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="menuitem"
                className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
                onClick={() => handleSelect(option.value)}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700 ring-1 ring-primary-100">
                  {option.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900">{t(option.labelKey)}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-gray-500">{t(option.descriptionKey)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
