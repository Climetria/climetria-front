'use client';

import { useState, useEffect, useMemo } from 'react';

interface UseFilteredPaginationProps<T> {
  data: T[];
  itemsPerPage: number;
  searchTerm?: string;
  filters?: Record<string, string>;
  filterFn?: (item: T, searchTerm: string, filters: Record<string, string>) => boolean;
}

export function useFilteredPagination<T>({
  data,
  itemsPerPage: initialItemsPerPage = 10,
  searchTerm = '',
  filters = {},
  filterFn,
}: UseFilteredPaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    if (!filterFn) {
      // fallback: filter by searchTerm if present
      if (searchTerm) {
        return data.filter((item) => {
          const values = Object.values(item as Record<string, unknown>);
          return values.some(
            (v) => typeof v === 'string' && v.toLowerCase().includes(searchTerm.toLowerCase()),
          );
        });
      }
      return data;
    }
    // filterFn may or may not accept filters
    return data.filter((item) => filterFn(item, searchTerm, filters));
  }, [data, searchTerm, filters, filterFn]);

  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Only reset to first page if searchTerm or filters actually change value
  useEffect(() => {
    setCurrentPage(1);
  }, [JSON.stringify(filters), searchTerm]);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedData,
    filteredData,
    totalItems: filteredData.length,
  };
}
