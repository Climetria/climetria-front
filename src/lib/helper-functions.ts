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
