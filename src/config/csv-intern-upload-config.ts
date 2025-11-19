/**
 * Configuration and documentation for CSV intern bulk upload
 */

export interface CsvColumnDefinition {
  name: string;
  description: string;
  required: boolean;
  allowedValues?: string[];
  example?: string;
  notes?: string;
}

export const CSV_INTERN_COLUMNS: CsvColumnDefinition[] = [
  {
    name: 'tipo_documento',
    description: 'Tipo de documento de identidad',
    required: true,
    allowedValues: ['DNI', 'CE', 'PASSPORT'],
    example: 'DNI',
    notes: 'DNI = Documento Nacional de Identidad, CE = Carné de Extranjería, PASSPORT = Pasaporte',
  },
  {
    name: 'documento',
    description: 'Número de documento',
    required: true,
    example: '72782331',
    notes: 'DNI: 8 dígitos, CE: 9 dígitos, Pasaporte: variable',
  },
  {
    name: 'correo',
    description: 'Correo electrónico del pasante',
    required: true,
    example: 'ejemplo@gmail.com',
  },
  {
    name: 'nombres',
    description: 'Nombres del pasante',
    required: true,
    example: 'Selene Solmaira',
  },
  {
    name: 'apellido_paterno',
    description: 'Apellido paterno del pasante',
    required: true,
    example: 'Rojas',
  },
  {
    name: 'apellido_materno',
    description: 'Apellido materno del pasante',
    required: true,
    example: 'Santamaria',
  },
  {
    name: 'genero',
    description: 'Género del pasante',
    required: true,
    allowedValues: ['Masculino', 'Femenino', 'Prefiero no decirlo'],
    example: 'Femenino',
  },
  {
    name: 'telefono',
    description: 'Número de teléfono',
    required: true,
    example: '922042179',
    notes: 'Incluir código de país si es internacional',
  },
  {
    name: 'universidad',
    description: 'Nombre de la universidad',
    required: true,
    example: 'Universidad Nacional de Ingenieria',
  },
  {
    name: 'carrera',
    description: 'Carrera universitaria',
    required: true,
    allowedValues: [
      'Ingenieria_Forestal',
      'Ingenieria_Ambiental',
      'Gestion_Ambiental',
      'Biologia',
      'Otras',
    ],
    example: 'Ingenieria_Ambiental',
    notes: 'Usar guiones bajos (_) en lugar de espacios',
  },
  {
    name: 'otra_carrera',
    description: 'Especificar otra carrera si seleccionó "Otras"',
    required: false,
    example: 'Ingenieria Agronomica',
    notes: 'Solo llenar si carrera = "Otras"',
  },
  {
    name: 'anio_graduacion',
    description: 'Año de graduación o egreso',
    required: true,
    example: '2022',
    notes: 'Formato: YYYY (4 dígitos)',
  },
  {
    name: 'fuente',
    description: 'Fuente de referencia',
    required: true,
    allowedValues: ['Correo', 'Redes Sociales', 'Recomendacion', 'CEIA', 'Otros'],
    example: 'Correo',
  },
  {
    name: 'temas_interes',
    description: 'Temas de interés (ejes temáticos)',
    required: true,
    allowedValues: ['HC', 'HH', 'CN'],
    example: 'HC,HH',
    notes:
      'HC = Huella de Carbono, HH = Huella Hídrica, CN = Carbono Neutralidad. Separar múltiples valores con comas',
  },
  {
    name: 'pais',
    description: 'País de residencia',
    required: true,
    example: 'Peru',
  },
  {
    name: 'departamento',
    description: 'Departamento (solo para Perú)',
    required: false,
    allowedValues: [
      'AMAZONAS',
      'ANCASH',
      'APURIMAC',
      'AREQUIPA',
      'AYACUCHO',
      'CAJAMARCA',
      'CALLAO',
      'CUSCO',
      'HUANCAVELICA',
      'HUANUCO',
      'ICA',
      'JUNIN',
      'LA_LIBERTAD',
      'LAMBAYEQUE',
      'LIMA_METROPOLITANA',
      'LIMA_PROVINCIAS',
      'LORETO',
      'MADRE_DE_DIOS',
      'MOQUEGUA',
      'PASCO',
      'PIURA',
      'PUNO',
      'SAN_MARTIN',
      'TACNA',
      'TUMBES',
      'UCAYALI',
    ],
    example: 'LIMA_METROPOLITANA',
    notes: 'Obligatorio solo si pais = "Peru". Usar guiones bajos y mayúsculas',
  },
];

export const CSV_UPLOAD_NOTES = [
  'El archivo debe estar en formato CSV (valores separados por comas)',
  'La primera fila debe contener los nombres de las columnas exactamente como se especifican',
  'Los campos marcados como requeridos no deben estar vacíos',
  'Los valores con múltiples opciones (como temas_interes) deben separarse con comas sin espacios',
  'Usar codificación UTF-8 para caracteres especiales',
];
