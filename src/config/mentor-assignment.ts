import type { Mentor, Company } from '@/lib/api';

export const mentorAssignmentConfig = {
  title: 'Asignar Mentor a Empresa',
  description: (mentor: Mentor) =>
    `Selecciona una empresa para asignar a ${mentor.firstNames} ${mentor.lastNameFather} ${mentor.lastNameMother}`,
  searchPlaceholder: 'Buscar empresas...',
  assignButtonText: 'Asignar Mentor',
  loadingText: 'Asignando...',
  noEntitiesMessage: 'No hay empresas disponibles en este curso',
  noResultsMessage: 'No se encontraron empresas con los criterios de búsqueda',
  entityDisplayName: (company: Company) => company.organizationName,
  entitySubtitle: (company: Company) => `Contacto: ${company.contactName}`,
  entityContact: (company: Company) => company.email,
};

export const mentorUnassignmentConfig = {
  title: 'Desasignar Mentor',
  description: (mentor: Mentor) =>
    `¿Estás seguro de que quieres desasignar a ${mentor.firstNames} ${mentor.lastNameFather} ${mentor.lastNameMother} de su empresa actual?`,
  confirmButtonText: 'Desasignar',
  loadingText: 'Desasignando...',
};
