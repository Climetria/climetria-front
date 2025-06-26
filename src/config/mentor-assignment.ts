import type { Mentor, Organization } from '@/lib/api';

export const mentorAssignmentConfig = {
  title: 'Asignar Mentor a Organización',
  description: (mentor: Mentor) =>
    `Selecciona una organización para asignar a ${mentor.firstNames} ${mentor.lastNameFather} ${mentor.lastNameMother}`,
  searchPlaceholder: 'Buscar organizaciones...',
  assignButtonText: 'Asignar Mentor',
  loadingText: 'Asignando...',
  noEntitiesMessage: 'No hay organizaciones disponibles en este curso',
  noResultsMessage: 'No se encontraron organizaciones con los criterios de búsqueda',
  entityDisplayName: (organization: Organization) => organization.organizationName,
  entitySubtitle: (organization: Organization) => `Contacto: ${organization.contactName}`,
  entityContact: (organization: Organization) => organization.email,
};

export const mentorUnassignmentConfig = {
  title: 'Desasignar Mentor',
  description: (mentor: Mentor) =>
    `¿Estás seguro de que quieres desasignar a ${mentor.firstNames} ${mentor.lastNameFather} ${mentor.lastNameMother} de su organización actual?`,
  confirmButtonText: 'Desasignar',
  loadingText: 'Desasignando...',
};
