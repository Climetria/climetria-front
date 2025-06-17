import { Intern } from '@/lib/api';

export interface CsvUploadInternResponseDto {
  validInterns: Intern[];
  invalidRows: {
    rowNumber: number;
    errors: string[];
    rawData: Record<string, string>;
  }[];
}
