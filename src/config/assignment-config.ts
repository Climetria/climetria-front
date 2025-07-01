import type { Mentor, Intern, OrganizationWithFilter } from '@/lib/api';

// Tipo unión para entidades asignables
type AssignableEntity = Mentor | Intern;

// Helper function para verificar si es un Intern
export function isIntern(entity: AssignableEntity): entity is Intern {
  return 'universityName' in entity;
}

// Helper function para verificar si es un Mentor
export function isMentor(entity: AssignableEntity): entity is Mentor {
  return !('universityName' in entity);
}

export const organizationMentorAssignmentConfig = {
  title: 'Asignar Mentor a Organización',
  description: (organization: OrganizationWithFilter) =>
    `Selecciona un mentor para asignar a ${organization.organization.organizationName}`,
  searchPlaceholder: 'Buscar mentores...',
  assignButtonText: 'Asignar Mentor',
  loadingText: 'Asignando...',
  noEntitiesMessage: 'No hay mentores disponibles en este curso',
  noResultsMessage: 'No se encontraron mentores con los criterios de búsqueda',
  entityDisplayName: (entity: AssignableEntity) => {
    return `${entity.firstNames} ${entity.lastNameFather} ${entity.lastNameMother}`;
  },
  entitySubtitle: (entity: AssignableEntity) => entity.email,
  entityContact: (entity: AssignableEntity) => entity.phone,
  allowMultipleSelection: false, // Una organización solo puede tener UN mentor
  maxAssignments: 1, // Límite de 1 mentor por organización
};

export const organizationInternAssignmentConfig = {
  title: 'Asignar Pasantes a Organización',
  description: (organization: OrganizationWithFilter) =>
    `Selecciona pasantes para asignar a ${organization.organization.organizationName}`,
  searchPlaceholder: 'Buscar pasantes...',
  assignButtonText: 'Asignar Pasantes',
  loadingText: 'Asignando...',
  noEntitiesMessage: 'No hay pasantes disponibles que hagan match con esta organización',
  noResultsMessage: 'No se encontraron pasantes con los criterios de búsqueda',
  entityDisplayName: (entity: AssignableEntity) => {
    return `${entity.firstNames} ${entity.lastNameFather} ${entity.lastNameMother}`;
  },
  entitySubtitle: (entity: AssignableEntity) => entity.email,
  entityContact: (entity: AssignableEntity) => entity.phone,
  allowMultipleSelection: true, // Múltiples pasantes por organización
  maxAssignments: undefined, // Se define dinámicamente basado en maximumNumberOfInterns
};
