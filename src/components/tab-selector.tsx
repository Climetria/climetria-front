'use client';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

interface TabSelectorProps {
  activeTab: 'curso' | 'general';
  onTabChange: (tab: 'curso' | 'general') => void;
  className?: string;
}

export function TabSelector({ activeTab, onTabChange, className }: TabSelectorProps) {
  const { state } = useSidebar();

  // Ocultar el TabSelector cuando el sidebar está colapsado
  if (state === 'collapsed') {
    return null;
  }

  return (
    <div className={cn('flex bg-muted rounded-lg p-1 mx-1 mb-2', className)}>
      <button
        onClick={() => onTabChange('curso')}
        className={cn(
          'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          activeTab === 'curso'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Curso
      </button>
      <button
        onClick={() => onTabChange('general')}
        className={cn(
          'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          activeTab === 'general'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        General
      </button>
    </div>
  );
}
