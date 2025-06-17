/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useWatch, Control, UseFormSetValue } from 'react-hook-form';

const departments = [
  { label: 'Amazonas', value: 'AMAZONAS' },
  { label: 'Ancash', value: 'ANCASH' },
  { label: 'Apurímac', value: 'APURIMAC' },
  { label: 'Arequipa', value: 'AREQUIPA' },
  { label: 'Ayacucho', value: 'AYACUCHO' },
  { label: 'Cajamarca', value: 'CAJAMARCA' },
  { label: 'Callao', value: 'CALLAO' },
  { label: 'Cusco', value: 'CUSCO' },
  { label: 'Huancavelica', value: 'HUANCAVELICA' },
  { label: 'Huánuco', value: 'HUANUCO' },
  { label: 'Ica', value: 'ICA' },
  { label: 'Junín', value: 'JUNIN' },
  { label: 'La Libertad', value: 'LA_LIBERTAD' },
  { label: 'Lambayeque', value: 'LAMBAYEQUE' },
  { label: 'Lima Metropolitana', value: 'LIMA_METROPOLITANA' },
  { label: 'Lima Provincias', value: 'LIMA_PROVINCIAS' },
  { label: 'Loreto', value: 'LORETO' },
  { label: 'Madre de Dios', value: 'MADRE_DE_DIOS' },
  { label: 'Moquegua', value: 'MOQUEGUA' },
  { label: 'Pasco', value: 'PASCO' },
  { label: 'Piura', value: 'PIURA' },
  { label: 'Puno', value: 'PUNO' },
  { label: 'San Martín', value: 'SAN_MARTIN' },
  { label: 'Tacna', value: 'TACNA' },
  { label: 'Tumbes', value: 'TUMBES' },
  { label: 'Ucayali', value: 'UCAYALI' },
];

interface ResidencyFieldsProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}

export function ResidencyFields({ control, setValue }: ResidencyFieldsProps) {
  // Watching the selector field to determine what UI to show
  const selected = useWatch({ control, name: 'countrySelector' });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Country Selector */}
      <FormField
        control={control}
        name="countrySelector"
        render={({ field }) => (
          <FormItem>
            <FormLabel>País *</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Set the actual country value when a known country is selected
                if (value !== 'Otros') {
                  setValue('country', value);
                } else {
                  setValue('country', ''); // Clear country if "Others" is selected
                }
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un país" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Perú">Perú</SelectItem>
                <SelectItem value="Otros">Otros</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Department dropdown - only shown when Peru is selected */}
      {selected === 'Perú' && (
        <FormField
          control={control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departmento de residencia *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un departamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Manual country input - only shown when "Others" is selected */}
      {selected === 'Otros' && (
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especifica tu país *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresa tu país"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
