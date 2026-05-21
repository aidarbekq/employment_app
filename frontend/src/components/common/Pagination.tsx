import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  startIndex: number;
  totalItems: number;
  totalPages: number;
  className?: string;
}

const buildPages = (currentPage: number, totalPages: number) => {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  endIndex,
  onPageChange,
  pageSize = 10,
  startIndex,
  totalItems,
  totalPages,
  className,
}) => {
  const { t } = useTranslation();

  if (totalItems <= pageSize) {
    return null;
  }

  const pages = buildPages(currentPage, totalPages);

  return (
    <nav
      className={clsx(
        'mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      aria-label={t('common.pagination')}
    >
      <p className="text-sm text-gray-500">
        {t('common.paginationSummary', { start: startIndex, end: endIndex, total: totalItems })}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex h-10 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('common.previous')}
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) => {
            const previous = pages[index - 1];
            const needsGap = previous && page - previous > 1;
            return (
              <React.Fragment key={page}>
                {needsGap && <span className="px-1 text-sm text-gray-400">…</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={clsx(
                    'h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition',
                    currentPage === page
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  )}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex h-10 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('common.next')}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
