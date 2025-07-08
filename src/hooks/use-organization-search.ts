'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';

export function useOrganizationSearch() {
  const [searchRuc, setSearchRuc] = useState<string>('');

  const {
    data: existingOrganization,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['organization-by-ruc', searchRuc],
    queryFn: () => apiService.getOrganizationByRuc(searchRuc),
    enabled: false, // Búsqueda manual
    retry: false,
    refetchOnWindowFocus: false,
  });

  const searchByRuc = async (ruc: string) => {
    if (ruc.length !== 11) {
      throw new Error('El RUC debe tener 11 dígitos');
    }

    // Actualizar el RUC primero y luego hacer refetch
    setSearchRuc(ruc);

    // Usar un pequeño delay para asegurar que el estado se actualice
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Hacer la búsqueda directamente con el RUC proporcionado
    return apiService.getOrganizationByRuc(ruc);
  };

  const clearSearch = () => {
    setSearchRuc('');
  };

  return {
    existingOrganization,
    isLoading,
    error,
    searchByRuc,
    clearSearch,
    hasSearched: !!searchRuc,
  };
}
