'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { es } from 'date-fns/locale';

interface DatePickerProps {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onChange,
  placeholder = 'Seleccionar fecha',
  disabled,
}: DatePickerProps) {
  // Función para manejar el cambio de fecha y evitar problemas de timezone
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Método más confiable: crear fecha local sin conversión UTC
      const localDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        12, // Usar mediodía para evitar cambios de DST
        0,
        0,
        0,
      );
      onChange(localDate);
    } else {
      onChange(undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'dd/MM/yyyy') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          locale={es}
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          // Opcional: deshabilitar fechas futuras si es necesario
          // disabled={(date) => date > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
