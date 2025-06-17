import type { Intern, Company } from '@/lib/api';

export const internAssignmentConfig = {
  title: 'Asignar Pasante a Empresa',
  description: (intern: Intern) =>
    `Selecciona una empresa para asignar a ${intern.firstNames} ${intern.lastNameFather} ${intern.lastNameMother}`,
  searchPlaceholder: 'Buscar empresas...',
  assignButtonText: 'Asignar Pasante',
  loadingText: 'Asignando...',
  noEntitiesMessage: 'No hay empresas disponibles en este curso',
  noResultsMessage: 'No se encontraron empresas con los criterios de búsqueda',
  entityDisplayName: (company: Company) => company.organizationName,
  entitySubtitle: (company: Company) => `Contacto: ${company.contactName}`,
  entityContact: (company: Company) => company.email,
};

export const internUnassignmentConfig = {
  title: 'Desasignar Pasante',
  description: (intern: Intern) =>
    `¿Estás seguro de que quieres desasignar a ${intern.firstNames} ${intern.lastNameFather} ${intern.lastNameMother} de su empresa actual?`,
  confirmButtonText: 'Desasignar',
  loadingText: 'Desasignando...',
};
