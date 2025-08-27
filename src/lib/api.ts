import type { CsvUploadInternResponseDto } from '@/interfaces/csvUploadIntern-response.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export interface Organization {
  id: string;
  ruc: string;
  email: string;
  contactName: string;
  phone: string;
  country: string;
  organizationName: string;
  organizationSize: 'SMALL' | 'LARGE';
  sector: string;
  topicsOfInterest: string[];
  logoUrl: string;
  signerFullName: string;
  signerTitle: string;
  signerSignatureUrl: string;
  // Campos opcionales agregados para el formulario
  maximumNumberOfInterns?: number;
  placeOfResidenceFilter?: string[];
  studiedMajorFilter?: string[];
  genderFilter?: 'MALE_ONLY' | 'FEMALE_ONLY' | 'BOTH';
  courseIds?: string[];
  courseStatus?: string;
  mentorIds?: string[];
  mentorStatus?: string;
  internIds?: string[];
  internStatus?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  mentorIds?: string[];
  organizationIds?: string[];
  internIds?: string[];
}

export interface Intern {
  id: string;
  documentType: 'DNI' | 'CE' | 'PASSPORT';
  document: string;
  email: string;
  firstNames: string;
  lastNameFather: string;
  lastNameMother: string;
  phone: string;
  gender: string;
  universityName: string;
  majorInProgress: string;
  graduationYear: number;
  referralSource: string;
  country: string;
  peruDepartment: string;
  topicsOfInterest: string[];
  courseId: string;
  createdAt: string;
  updatedAt: string;
  organizationStatus: string;
  organizationIds?: string[];
}

export interface Mentor {
  id: string;
  documentType: 'DNI' | 'CE' | 'PASSPORT';
  document: string;
  email: string;
  firstNames: string;
  lastNameFather: string;
  lastNameMother: string;
  phone: string;
  country: string;
  peruDepartment: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  organizationStatus: string;
  organizationIds?: string[];
}

export interface Grade {
  id: string;
  internId: string;
  courseId: string;
  mentorId: string;
  s1?: Attendance;
  s2?: Attendance;
  s3?: Attendance;
  s4?: Attendance;
  s5?: Attendance;
  s6?: Attendance;
  initialCommitment?: number;
  assertiveCommunication?: number;
  punctuality?: number;
  classParticipation?: number;
  proactivity?: number;
  communicationSkills?: number;
  punctualityOfDelivery?: number;
  redaction?: number;
  performance?: number;
  recommendation?: string;
  finalReportCheck: boolean;
  talkCheck: boolean;
  recommendationCheck: boolean;
  internshipCertificate: boolean;
  courseCertificate: boolean;
  totalNote: number;
  createdAt: string;
  updatedAt: string;
}

export type Attendance = 'A' | 'T' | 'F' | 'FJ';

export interface OrganizationWithFilter {
  organization: Organization;
  filter: {
    id: string;
    courseId: string;
    organizationId: string;
    maximumNumberOfInterns: number;
    placeOfResidenceFilter: string[];
    studiedMajorFilter: string[];
    extraRequirements: string;
    genderFilter: 'MALE_ONLY' | 'FEMALE_ONLY' | 'BOTH';
    createdAt: string;
    updatedAt: string;
  };
}

// Interfaces para métricas del dashboard
export interface TopIntern {
  internId: string;
  fullName: string;
  totalNote: number;
  recommended: boolean;
  recommendationComment?: string;
}
export interface CourseMetric {
  courseId: string;
  courseName: string;
  value: number;
}

export interface CourseCalendarItem {
  courseId: string;
  courseName: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'ONGOING' | 'COMPLETED';
}

export interface InternsAndOrganizations {
  courseId: string;
  courseName: string;
  internsWithOrg: number;
  organizationsWithTeam: number;
}

export interface DashboardMetrics {
  topInternsByCourse: TopIntern[];
  studentsPerCourse: CourseMetric[];
  finalReportsPerCourse: CourseMetric[];
  talksPerCourse: CourseMetric[];
  fullyEvaluatedPerCourse: CourseMetric[];
  certificatesPerCourse: CourseMetric[];
  courseCalendar: CourseCalendarItem[];
  internsAndOrganizations: InternsAndOrganizations[];
}
export interface InternshipCertificateData {
  fullName: string;
  course: string;
  organization: string;
}

// Interfaces para el payload de creación/actualización
export interface CreateOrganizationPayload {
  organization: {
    ruc: string;
    email: string;
    contactName: string;
    phone: string;
    country: string;
    organizationName: string;
    organizationSize: 'SMALL' | 'LARGE';
    sector: string;
    topicsOfInterest: string[];
  };
  filter: {
    maximumNumberOfInterns: number;
    placeOfResidenceFilter: string[];
    studiedMajorFilter: string[];
    extraRequirements: string;
    genderFilter: 'MALE_ONLY' | 'FEMALE_ONLY' | 'BOTH';
  };
}

export interface UpdateOrganizationPayload {
  organizationId: string;
  organization?: Partial<CreateOrganizationPayload['organization']>;
  filter: CreateOrganizationPayload['filter'];
}

export interface OrganizationCertificateInfo {
  id: string;
  organizationId: string;
  signerFullName: string;
  signerTitle: string;
  logoUrl: string;
  signatureUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Utility to read cookies from the client
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

class ApiService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit) {
    try {
      const token = getCookieValue('accessToken');
      const requestOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers,
        },
        ...options,
      };

      console.log(`Making request to: ${API_BASE_URL}${url}`);
      console.log('Request options:', requestOptions);

      const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorBody;
        try {
          errorBody = await response.text();
          console.log('Error response body:', errorBody);
        } catch (e) {
          console.log('Could not read error response body. Error:', e);
        }
        throw new Error(
          `API Error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`,
        );
      }

      // Avoid parsing .json() if there is no content
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      if (
        response.status === 204 ||
        !contentType ||
        Number.parseInt(contentLength || '0', 10) === 0
      ) {
        return null;
      }

      if (contentType.includes('application/json')) {
        const responseData = await response.json();
        console.log('Response data:', responseData);
        return responseData;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  private async fetchWithFormData(url: string, formData: FormData) {
    try {
      const token = getCookieValue('accessToken');
      const requestOptions: RequestInit = {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Don't set Content-Type for FormData, let the browser set it with boundary
        },
        body: formData,
      };

      console.log(`Making FormData request to: ${API_BASE_URL}${url}`);

      const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorBody;
        try {
          errorBody = await response.text();
          console.log('Error response body:', errorBody);
        } catch (e) {
          console.log('Could not read error response body. Error:', e);
        }
        throw new Error(
          `API Error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`,
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        console.log('Response data:', responseData);
        return responseData;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  // Internship Certificate
  async getInternshipCertificateData(internId: string): Promise<InternshipCertificateData> {
    return this.fetchWithErrorHandling(`/certificates/internships/${internId}`);
  }

  // Upload organization certificate info
  async uploadOrganizationCertificateInfo(
    organizationId: string,
    formData: FormData,
  ): Promise<OrganizationCertificateInfo> {
    return this.fetchWithFormData(`/organizations/${organizationId}/certificate-info`, formData);
  }

  // Metrics
  async getDashboardMetrics(courseId: string): Promise<DashboardMetrics> {
    return this.fetchWithErrorHandling(`/metrics/summary/${courseId}`);
  }
  // Courses
  async getAllCourses(): Promise<Course[]> {
    return this.fetchWithErrorHandling('/courses');
  }

  async getCourse(courseId: string): Promise<Course> {
    return this.fetchWithErrorHandling(`/courses/${courseId}`);
  }

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    return this.fetchWithErrorHandling('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
    return this.fetchWithErrorHandling(`/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(courseId: string): Promise<void> {
    return this.fetchWithErrorHandling(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  // Organizations
  async getAllOrganizations(): Promise<Organization[]> {
    return this.fetchWithErrorHandling(`/organizations`);
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    return this.fetchWithErrorHandling(`/organizations/${organizationId}`, {
      method: 'DELETE',
    });
  }

  async getAllOrganizationsWithinCourse(courseId: string): Promise<OrganizationWithFilter[]> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/organizations`);
  }

  async getOrganizationWithinCourse(
    courseId: string,
    organizationId: string,
  ): Promise<Organization> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/organizations/${organizationId}`);
  }

  // NEW: Get organization by RUC
  async getOrganizationByRuc(ruc: string): Promise<Organization> {
    return this.fetchWithErrorHandling(`/organizations/ruc/${ruc}`);
  }

  // Agregar el nuevo método después de getOrganizationByRuc
  async assignOrganizationToCourseWithFilter(
    courseId: string,
    organizationId: string,
    filterData: {
      maximumNumberOfInterns: number;
      placeOfResidenceFilter: string[];
      studiedMajorFilter: string[];
      extraRequirements: string;
      genderFilter: 'MALE_ONLY' | 'FEMALE_ONLY' | 'BOTH';
    },
  ): Promise<OrganizationWithFilter> {
    const payload = {
      maximumNumberOfInterns: filterData.maximumNumberOfInterns,
      placeOfResidenceFilter: filterData.placeOfResidenceFilter,
      studiedMajorFilter: filterData.studiedMajorFilter,
      extraRequirements: filterData.extraRequirements,
      genderFilter: filterData.genderFilter,
    };

    return this.fetchWithErrorHandling(
      `/courses/${courseId}/organizations/${organizationId}/assign`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  }

  // Modificar el método createOrUpdateOrganizationWithPreferences
  async createOrUpdateOrganizationWithPreferences(
    courseId: string,
    payload: CreateOrganizationPayload | UpdateOrganizationPayload,
  ): Promise<Organization> {
    if ('organizationId' in payload) {
      // Para organizaciones existentes, usar el nuevo endpoint de asignación
      const result = await this.assignOrganizationToCourseWithFilter(
        courseId,
        payload.organizationId,
        payload.filter,
      );

      // Si hay cambios en los datos de la organización, actualizarlos por separado
      if (payload.organization) {
        // Actualizar los datos de la organización usando el endpoint directo
        await this.fetchWithErrorHandling(`/organizations/${payload.organizationId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload.organization),
        });
      }

      return result.organization;
    } else {
      // Para organizaciones nuevas, crear con estructura plana
      const createPayload = {
        organization: {
          ruc: payload.organization.ruc,
          email: payload.organization.email,
          contactName: payload.organization.contactName,
          phone: payload.organization.phone,
          country: payload.organization.country,
          organizationName: payload.organization.organizationName,
          organizationSize: payload.organization.organizationSize,
          sector: payload.organization.sector,
          topicsOfInterest: payload.organization.topicsOfInterest,
        },
        filter: {
          maximumNumberOfInterns: payload.filter.maximumNumberOfInterns,
          placeOfResidenceFilter: payload.filter.placeOfResidenceFilter,
          studiedMajorFilter: payload.filter.studiedMajorFilter,
          extraRequirements: payload.filter.extraRequirements,
          genderFilter: payload.filter.genderFilter,
        },
      };

      return this.fetchWithErrorHandling(`/courses/${courseId}/organizations`, {
        method: 'POST',
        body: JSON.stringify(createPayload),
      });
    }
  }

  async createOrganizationWithinCourse(
    courseId: string,
    organizationData: Partial<Organization>,
  ): Promise<Organization> {
    const organization = {
      ruc: organizationData.ruc,
      email: organizationData.email,
      contactName: organizationData.contactName,
      phone: organizationData.phone,
      country: organizationData.country,
      organizationName: organizationData.organizationName,
      organizationSize: organizationData.organizationSize,
      sector: organizationData.sector,
      topicsOfInterest: organizationData.topicsOfInterest,
    };

    const filter = {
      maximumNumberOfInterns: organizationData.maximumNumberOfInterns,
      placeOfResidenceFilter: organizationData.placeOfResidenceFilter,
      studiedMajorFilter: organizationData.studiedMajorFilter,
      genderFilter: organizationData.genderFilter,
    };

    const payload = { organization, filter };
    console.log('Payload enviado a la API:', payload);

    return this.fetchWithErrorHandling(`/courses/${courseId}/organizations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateOrganizationWithinCourse(
    courseId: string,
    organizationId: string,
    organizationData: Partial<Organization>,
  ): Promise<Organization> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/organizations/${organizationId}`, {
      method: 'PATCH',
      body: JSON.stringify(organizationData),
    });
  }

  async deleteOrganizationWithinCourse(courseId: string, organizationId: string): Promise<void> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/organizations/${organizationId}`, {
      method: 'DELETE',
    });
  }

  // Interns
  async getAllInterns(): Promise<Intern[]> {
    return this.fetchWithErrorHandling(`/interns`);
  }

  async updateIntern(internId: string, internData: Partial<Intern>): Promise<Intern> {
    return this.fetchWithErrorHandling(`/interns/${internId}`, {
      method: 'PATCH',
      body: JSON.stringify(internData),
    });
  }

  async deleteIntern(internId: string): Promise<void> {
    return this.fetchWithErrorHandling(`/interns/${internId}`, {
      method: 'DELETE',
    });
  }

  async getAllInternsWithinCourse(courseId: string): Promise<Intern[]> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns`);
  }

  async getInternWithinCourse(courseId: string, internId: string): Promise<Intern> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns/${internId}`);
  }

  async createInternWithinCourse(courseId: string, internData: Partial<Intern>): Promise<Intern> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns`, {
      method: 'POST',
      body: JSON.stringify(internData),
    });
  }

  async updateInternWithinCourse(
    courseId: string,
    internId: string,
    internData: Partial<Intern>,
  ): Promise<Intern> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns/${internId}`, {
      method: 'PATCH',
      body: JSON.stringify(internData),
    });
  }

  async deleteInternWithinCourse(courseId: string, internId: string): Promise<void> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns/${internId}`, {
      method: 'DELETE',
    });
  }

  async uploadInternsBatchWithinCourse(
    courseId: string,
    file: File,
  ): Promise<CsvUploadInternResponseDto> {
    const token = getCookieValue('accessToken');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/interns/batch`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return response.json();
  }

  // NEW: Get interns that match with an organization
  async getInternsMatchingOrganization(
    courseId: string,
    organizationId: string,
  ): Promise<Intern[]> {
    return this.fetchWithErrorHandling(
      `/courses/${courseId}/interns/organizations/${organizationId}`,
    );
  }

  // Mentors
  async getAllMentors(): Promise<Mentor[]> {
    return this.fetchWithErrorHandling(`/mentors`);
  }

  async getAllMentorsWithinCourse(courseId: string): Promise<Mentor[]> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/mentors`);
  }

  async getMentorWithinCourse(courseId: string, mentorId: string): Promise<Mentor> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/mentors/${mentorId}`);
  }

  async createMentorWithinCourse(courseId: string, mentorData: Partial<Mentor>): Promise<Mentor> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/mentors`, {
      method: 'POST',
      body: JSON.stringify(mentorData),
    });
  }

  async updateMentorWithinCourse(
    courseId: string,
    mentorId: string,
    mentorData: Partial<Mentor>,
  ): Promise<Mentor> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/mentors/${mentorId}`, {
      method: 'PATCH',
      body: JSON.stringify(mentorData),
    });
  }

  async deleteMentorWithinCourse(courseId: string, mentorId: string): Promise<void> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/mentors/${mentorId}`, {
      method: 'DELETE',
    });
  }

  async deleteMentor(mentorId: string): Promise<void> {
    return this.fetchWithErrorHandling(`/mentors/${mentorId}`, {
      method: 'DELETE',
    });
  }

  // ===== ASSIGNMENT METHODS =====
  /**
   * Assign a mentor to a organization within a specific course
   */
  async assignMentorToOrganization(
    courseId: string,
    mentorId: string,
    organizationId: string,
  ): Promise<void> {
    return this.fetchWithErrorHandling(
      `/courses/${courseId}/organizations/${organizationId}/mentors/${mentorId}`,
      {
        method: 'PATCH',
      },
    );
  }

  /**
   * Assign an intern to a organization within a specific course
   */
  async assignInternToOrganization(
    courseId: string,
    organizationId: string,
    internId: string,
  ): Promise<void> {
    return this.fetchWithErrorHandling(
      `/courses/${courseId}/organizations/${organizationId}/interns/${internId}`,
      {
        method: 'PATCH',
      },
    );
  }

  /**
   * Remove a mentor's assignment from a organization
   */
  async removeMentorFromOrganizationWithinCourse(
    courseId: string,
    organizationId: string,
    mentorId: string,
  ): Promise<void> {
    return this.fetchWithErrorHandling(
      `/courses/${courseId}/organizations/${organizationId}/mentors/${mentorId}`,
      {
        method: 'DELETE',
      },
    );
  }

  /**
   * Remove an intern's assignment from a organization
   */
  async removeInternFromOrganizationWithinCourse(
    courseId: string,
    organizationId: string,
    internId: string,
  ): Promise<void> {
    return this.fetchWithErrorHandling(
      `/courses/${courseId}/organizations/${organizationId}/interns/${internId}`,
      {
        method: 'DELETE',
      },
    );
  }

  /**
   * Get all mentors assigned to a specific organization within a course
   */
  async getAllOrganizationMentorsWithinCourse(
    courseId: string,
    organizationId: string,
  ): Promise<Mentor[]> {
    return this.fetchWithErrorHandling(
      `/courses/${courseId}/organizations/${organizationId}/mentors`,
    );
  }

  /**
   * Get all interns assigned to a specific organization within a course
   */
  async getAllOrganizationInternsWithinCourse(
    courseId: string,
    organizationId: string,
  ): Promise<Intern[]> {
    return this.fetchWithErrorHandling(
      `/courses/${courseId}/organizations/${organizationId}/interns`,
    );
  }

  /**
   * Assign multiple mentors to a organization at once
   */
  async assignMultipleMentorsToOrganization(
    courseId: string,
    organizationId: string,
    mentorIds: string[],
  ): Promise<void> {
    const promises = mentorIds.map((mentorId) =>
      this.assignMentorToOrganization(courseId, organizationId, mentorId),
    );
    await Promise.all(promises);
  }

  /**
   * Assign multiple interns to a organization at once
   */
  async assignMultipleInternsToOrganization(
    courseId: string,
    organizationId: string,
    internIds: string[],
  ): Promise<void> {
    const promises = internIds.map((internId) =>
      this.assignInternToOrganization(courseId, organizationId, internId),
    );
    await Promise.all(promises);
  }

  // Grades
  async getInternGradeForMentor(mentorCognitoUser: string): Promise<Grade> {
    return this.fetchWithErrorHandling(`/mentor/${mentorCognitoUser}/grades`);
  }

  async getInternGradeWithinCourse(courseId: string, internId: string): Promise<Grade> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns/${internId}/grade`);
  }

  async getGradesWithinCourse(courseId: string): Promise<Grade[]> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/grades`);
  }

  async getInternGradeGlobally(): Promise<Grade> {
    return this.fetchWithErrorHandling(`/grades`);
  }

  async updateInternGradeWithinCourse(
    courseId: string,
    internId: string,
    gradeData: Partial<Grade>,
  ): Promise<Grade> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns/${internId}/grade`, {
      method: 'PATCH',
      body: JSON.stringify(gradeData),
    });
  }

  async updateInternGradeGlobally(gradeId: string, gradeData: Partial<Grade>): Promise<Grade> {
    return this.fetchWithErrorHandling(`/grades/${gradeId}`, {
      method: 'PATCH',
      body: JSON.stringify(gradeData),
    });
  }
}

export const apiService = new ApiService();
