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
    if (!filterFn) return data;
    return data.filter((item) => filterFn(item, searchTerm, filters));
  }, [data, searchTerm, filters, filterFn]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

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
