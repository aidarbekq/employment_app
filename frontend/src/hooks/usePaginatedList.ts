import { useEffect, useMemo, useState } from 'react';

export const DEFAULT_PAGE_SIZE = 10;

export const usePaginatedList = <T,>(items: T[], pageSize = DEFAULT_PAGE_SIZE, resetKey = '') => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [resetKey]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return {
    currentPage,
    endIndex,
    pageSize,
    paginatedItems,
    setCurrentPage,
    startIndex,
    totalItems,
    totalPages,
  };
};
