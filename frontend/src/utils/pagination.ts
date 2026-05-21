export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
}

export interface PaginationMeta {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_PAGE_SIZE = 10;

export const isPaginatedResponse = <T>(data: unknown): data is PaginatedResponse<T> => {
  return Boolean(data && typeof data === 'object' && 'results' in data && Array.isArray((data as { results?: unknown }).results));
};

export const getListResults = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (isPaginatedResponse<T>(data)) return data.results;
  return [];
};

export const getPaginationMeta = <T>(data: unknown, fallbackPage = 1, fallbackPageSize = DEFAULT_PAGE_SIZE): PaginationMeta => {
  if (isPaginatedResponse<T>(data)) {
    return {
      count: data.count,
      page: data.page,
      pageSize: data.page_size,
      totalPages: Math.max(1, data.total_pages),
    };
  }

  const count = Array.isArray(data) ? data.length : 0;
  return {
    count,
    page: fallbackPage,
    pageSize: fallbackPageSize,
    totalPages: Math.max(1, Math.ceil(count / fallbackPageSize)),
  };
};

export const getPaginationRange = (meta: PaginationMeta) => {
  if (meta.count === 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  const startIndex = (meta.page - 1) * meta.pageSize + 1;
  const endIndex = Math.min(meta.page * meta.pageSize, meta.count);
  return { startIndex, endIndex };
};
