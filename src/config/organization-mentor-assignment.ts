import type { Mentor, Organization } from '@/lib/api';

export const organizationMentorAssignmentConfig = {
  title: 'Asignar Mentores a Organización',
  description: (organization: Organization) =>
    `Selecciona uno o varios mentores para asignar a ${organization.organizationName}`,
  searchPlaceholder: 'Buscar mentores...',
  assignButtonText: 'Asignar Mentores',
  loadingText: 'Asignando...',
  noEntitiesMessage: 'No hay mentores disponibles en este curso',
  noResultsMessage: 'No se encontraron mentores con los criterios de búsqueda',
  entityDisplayName: (mentor: Mentor) =>
    `${mentor.firstNames} ${mentor.lastNameFather} ${mentor.lastNameMother}`,
  entitySubtitle: (mentor: Mentor) => `Email: ${mentor.email}`,
  entityContact: (mentor: Mentor) => mentor.phone,
  allowMultipleSelection: true, // Nueva propiedad para permitir selección múltiple
};

export const organizationMentorUnassignmentConfig = {
  title: 'Desasignar Mentores',
  description: (organization: Organization) =>
    `Selecciona los mentores que deseas desasignar de ${organization.organizationName}`,
  confirmButtonText: 'Desasignar Seleccionados',
  loadingText: 'Desasignando...',
  allowMultipleSelection: true, // Para permitir desasignar múltiples mentores
};
