import type { Intern, Organization } from '@/lib/api';

export const internAssignmentConfig = {
  title: 'Asignar Pasante a Organización',
  description: (intern: Intern) =>
    `Selecciona una organización para asignar a ${intern.firstNames} ${intern.lastNameFather} ${intern.lastNameMother}`,
  searchPlaceholder: 'Buscar organizaciones...',
  assignButtonText: 'Asignar Pasante',
  loadingText: 'Asignando...',
  noEntitiesMessage: 'No hay organizaciones disponibles en este curso',
  noResultsMessage: 'No se encontraron organizaciones con los criterios de búsqueda',
  entityDisplayName: (organization: Organization) => organization.organizationName,
  entitySubtitle: (organization: Organization) => `Contacto: ${organization.contactName}`,
  entityContact: (organization: Organization) => organization.email,
};

export const internUnassignmentConfig = {
  title: 'Desasignar Pasante',
  description: (intern: Intern) =>
    `¿Estás seguro de que quieres desasignar a ${intern.firstNames} ${intern.lastNameFather} ${intern.lastNameMother} de su organización actual?`,
  confirmButtonText: 'Desasignar',
  loadingText: 'Desasignando...',
};
