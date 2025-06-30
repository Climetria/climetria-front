'use client';

import { usePathname } from 'next/navigation';
import { breadcrumbMap } from '@/lib/breadcrumbs';

export function useBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbItems = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    return {
      label: breadcrumbMap[segment] || segment,
      href,
      isLast: index === segments.length - 1,
    };
  });

  return breadcrumbItems;
}
