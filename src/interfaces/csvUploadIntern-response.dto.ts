import { Intern } from '@/lib/api';

export interface CsvUploadInternResponseDto {
  successes: Array<{
    intern: Intern;
    status: 'created' | 'associated';
  }>;
  failures: Array<{
    rowNumber: number;
    errors: string[];
    rawData: Record<string, string>;
  }>;
}
