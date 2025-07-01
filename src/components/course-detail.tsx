import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import type { Intern, Mentor, OrganizationWithFilter } from '@/lib/api';

interface DetailSectionProps {
  title: string;
  loading: boolean;
  type: 'mentor' | 'intern' | 'organization';
  ids: string[];
  data: Mentor[] | Intern[] | OrganizationWithFilter[];
}

export function DetailSection({ title, loading, type, ids, data }: DetailSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : ids && ids.length > 0 ? (
          <div className="space-y-2">
            {ids.map((id, index) => {
              const item = data.find((i) =>
                type === 'organization'
                  ? (i as OrganizationWithFilter).organization.id === id
                  : (i as Intern | Mentor).id === id,
              );
              const displayName =
                type === 'intern' || type === 'mentor'
                  ? `${(item as Intern | Mentor)?.firstNames || ''} ${(item as Intern | Mentor)?.lastNameFather || ''} ${(item as Intern | Mentor)?.lastNameMother || ''}`
                  : `${(item as OrganizationWithFilter)?.organization.organizationName || `ID: ${id}`}`;
              return (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{item ? displayName : `${type} ID: ${id}`}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay {title.toLowerCase()} asignados</p>
        )}
      </CardContent>
    </Card>
  );
}
