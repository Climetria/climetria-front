import { Organization, OrganizationWithFilter } from '@/lib/api';

export interface CsvUploadOrganizationResponseDto {
  successes: Array<{
    organization: Organization;
    filter: OrganizationWithFilter['filter'];
    status: 'created' | 'associated';
  }>;
  failures: Array<{
    rowNumber: number;
    errors: string[];
    rawData: Record<string, string>;
  }>;
}
