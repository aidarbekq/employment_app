import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '@/services/api';
import { DEFAULT_PAGE_SIZE, getListResults, getPaginationMeta, PaginationMeta } from '@/utils/pagination';

type QueryValue = string | number | boolean | null | undefined;

type QueryParams = Record<string, QueryValue>;

interface UseServerPaginatedListOptions<T> {
  params?: QueryParams;
  pageSize?: number;
  enabled?: boolean;
  mapResults?: (items: T[]) => T[];
  onError?: (error: unknown) => void;
}

const cleanParams = (params: QueryParams = {}) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
};

export const useServerPaginatedList = <T,>(
  endpoint: string,
  { params = {}, pageSize = DEFAULT_PAGE_SIZE, enabled = true, mapResults, onError }: UseServerPaginatedListOptions<T> = {}
) => {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    count: 0,
    page: 1,
    pageSize,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const onErrorRef = useRef(onError);
  const mapResultsRef = useRef(mapResults);
  const lastParamsKeyRef = useRef('');

  useEffect(() => {
    onErrorRef.current = onError;
    mapResultsRef.current = mapResults;
  }, [mapResults, onError]);

  const paramsKey = useMemo(() => JSON.stringify(cleanParams(params)), [params]);

  const fetchPage = useCallback(async () => {
    if (!enabled) return;

    if (lastParamsKeyRef.current !== paramsKey) {
      lastParamsKeyRef.current = paramsKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await api.get(endpoint, {
        params: {
          ...JSON.parse(paramsKey),
          page,
          page_size: pageSize,
        },
      });
      const results = getListResults<T>(res.data);
      setItems(mapResultsRef.current ? mapResultsRef.current(results) : results);
      setMeta(getPaginationMeta<T>(res.data, page, pageSize));
    } catch (error) {
      onErrorRef.current?.(error);
      setItems([]);
      setMeta({ count: 0, page, pageSize, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [enabled, endpoint, page, pageSize, paramsKey]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    items,
    loading,
    meta,
    page,
    pageSize,
    refetch: fetchPage,
    setPage,
  };
};
