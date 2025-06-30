// Helper functions for various mappings and transformations

// Helper function to map document types
export const getDocTypeLabel = (docType: string) => {
  const docTypeMap = {
    DNI: 'DNI',
    CE: 'Carné de Extranjería',
    PASSPORT: 'Pasaporte',
  };
  return docTypeMap[docType as keyof typeof docTypeMap] || docType;
};

// Helper function to map organization size
export const getOrganizationSizeLabel = (size: string) => {
  const sizeMap = {
    SMALL: 'Pequeña',
    LARGE: 'Grande',
  };
  return sizeMap[size as keyof typeof sizeMap] || size;
};

// Helper function to map topics of interest
export const getTopicLabel = (topic: string) => {
  const topicMap = {
    CN: 'Carbono Neutralidad',
    HH: 'Huella Hídrica',
    HC: 'Huella de Carbono',
  };
  return topicMap[topic as keyof typeof topicMap] || topic;
};

export const getMajorLabel = (major: string) => {
  const majorMap = {
    FOREST_ENGINEERING: 'Ingeniería Forestal',
    ENVIRONMENTAL_ENGINEERING: 'Ingeniería Ambiental',
    ENVIRONMENTAL_MANAGEMENT: 'Gestión Ambiental',
    BIOLOGY: 'Biología',
    OTHERS: 'Otros',
  };
  return majorMap[major as keyof typeof majorMap] || major;
};

export const getGenderLabel = (gender: string) => {
  const genderMap = {
    MALE_ONLY: 'Masculino',
    FEMALE_ONLY: 'Femenino',
    BOTH: 'Masculino y Femenino',
    MALE: 'Masculino',
    FEMALE: 'Femenino',
    I_PREFER_NOT_TO_SAY_IT: 'Prefiero no decirlo',
  };
  return genderMap[gender as keyof typeof genderMap] || gender;
};

export const getDepartmentLabel = (department: string) => {
  const departmentMap = {
    AMAZONAS: 'Amazonas',
    ANCASH: 'Ancash',
    APURIMAC: 'Apurímac',
    AREQUIPA: 'Arequipa',
    AYACUCHO: 'Ayacucho',
    CAJAMARCA: 'Cajamarca',
    CALLAO: 'Callao',
    CUSCO: 'Cusco',
    HUANCAVELICA: 'Huancavelica',
    HUANUCO: 'Huánuco',
    ICA: 'Ica',
    JUNIN: 'Junín',
    LA_LIBERTAD: 'La Libertad',
    LAMBAYEQUE: 'Lambayeque',
    LIMA_METROPOLITANA: 'Lima Metropolitana',
    LIMA_PROVINCIAS: 'Lima Provincias',
    LORETO: 'Loreto',
    MADRE_DE_DIOS: 'Madre de Dios',
    MOQUEGUA: 'Moquegua',
    PASCO: 'Pasco',
    PIURA: 'Piura',
    PUNO: 'Puno',
    SAN_MARTIN: 'San Martín',
    TACNA: 'Tacna',
    TUMBES: 'Tumbes',
    UCAYALI: 'Ucayali',
  };
  return departmentMap[department as keyof typeof departmentMap] || department;
};

export const getReferralSourceLabel = (referralSource: string) => {
  const referralMap = {
    'redes-sociales': 'Redes sociales de Climetría',
    recomendacion: 'Femenino',
    ceia: 'CEIA UNALM',
    otros: 'Otros',
  };
  return referralMap[referralSource as keyof typeof referralMap] || referralSource;
};
