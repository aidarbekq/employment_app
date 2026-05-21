import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';

export type ExportFormat = 'pdf' | 'docx' | 'xlsx';

interface ExportMenuProps {
  onSelect: (format: ExportFormat) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const options: Array<{
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
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

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
    onSelect(format);
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
          className="absolute right-0 z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-900/12 ring-1 ring-black/5"
        >
          <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{t('admin.chooseExportFormat')}</p>
            <p className="mt-0.5 text-xs text-gray-500">{t('admin.chooseExportFormatHint')}</p>
          </div>
          <div className="p-2">
            {options.map((option) => (
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
