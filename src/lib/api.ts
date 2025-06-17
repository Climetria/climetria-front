import { CsvUploadInternResponseDto } from '@/interfaces/csvUploadIntern-response.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Company {
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
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  year: number;
  createdAt: string;
  updatedAt: string;
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
  universityName: string;
  profession: string;
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

      if (response.status === 204 || !contentType || parseInt(contentLength || '0', 10) === 0) {
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

  // Courses
  async getCourses(): Promise<Course[]> {
    return this.fetchWithErrorHandling('/courses');
  }

  async getCourse(courseId: string): Promise<Course> {
    return this.fetchWithErrorHandling(`/courses/${courseId}`);
  }

  async createCourse(courseData: {
    name: string;
    description?: string;
    year: number;
  }): Promise<Course> {
    return this.fetchWithErrorHandling('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  // Companies
  async getCompanies(courseId: string): Promise<Company[]> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/organizations`);
  }

  async getCompany(courseId: string, companyId: string): Promise<Company> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/organizations/${companyId}`);
  }

  async createCompany(courseId: string, companyData: Partial<Company>): Promise<Company> {
    // Make sure to only send the necessary fields for creation
    const cleanData = {
      ruc: companyData.ruc,
      email: companyData.email,
      contactName: companyData.contactName,
      phone: companyData.phone,
      country: companyData.country,
      organizationName: companyData.organizationName,
      organizationSize: companyData.organizationSize,
      sector: companyData.sector,
      topicsOfInterest: companyData.topicsOfInterest,
    };

    console.log('Clean company data to send:', cleanData);

    return this.fetchWithErrorHandling(`/courses/${courseId}/organizations`, {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
  }

  async updateCompany(
    courseId: string,
    companyId: string,
    companyData: Partial<Company>,
  ): Promise<Company> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/organizations/${companyId}`, {
      method: 'PATCH',
      body: JSON.stringify(companyData),
    });
  }

  async deleteCompany(courseId: string, companyId: string): Promise<void> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/organizations/${companyId}`, {
      method: 'DELETE',
    });
  }

  // Interns
  async getInterns(courseId: string): Promise<Intern[]> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns`);
  }

  async getIntern(courseId: string, internId: string): Promise<Intern> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns/${internId}`);
  }

  async createIntern(courseId: string, internData: Partial<Intern>): Promise<Intern> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns`, {
      method: 'POST',
      body: JSON.stringify(internData),
    });
  }

  async updateIntern(
    courseId: string,
    internId: string,
    internData: Partial<Intern>,
  ): Promise<Intern> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns/${internId}`, {
      method: 'PATCH',
      body: JSON.stringify(internData),
    });
  }

  async deleteIntern(courseId: string, internId: string): Promise<void> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/interns/${internId}`, {
      method: 'DELETE',
    });
  }

  async uploadInternsBatch(courseId: string, file: File): Promise<CsvUploadInternResponseDto> {
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

  // Mentors
  async getMentors(courseId: string): Promise<Mentor[]> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/mentors`);
  }

  async getMentor(courseId: string, mentorId: string): Promise<Mentor> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/mentors/${mentorId}`);
  }

  async createMentor(courseId: string, mentorData: Partial<Mentor>): Promise<Mentor> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/mentors`, {
      method: 'POST',
      body: JSON.stringify(mentorData),
    });
  }

  async updateMentor(
    courseId: string,
    mentorId: string,
    mentorData: Partial<Mentor>,
  ): Promise<Mentor> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/mentors/${mentorId}`, {
      method: 'PATCH',
      body: JSON.stringify(mentorData),
    });
  }

  async deleteMentor(courseId: string, mentorId: string): Promise<void> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/mentors/${mentorId}`, {
      method: 'DELETE',
    });
  }

  // ===== ASSIGNMENT METHODS =====

  /**
   * Assign a mentor to a company within a specific course
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
   * Assign an intern to a company within a specific course
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
   * Remove a mentor's assignment from a company
   */
  async removeMentorFromCompany(
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
   * Remove an intern's assignment from a company
   */
  async removeInternFromCompany(
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
   * Get all mentors assigned to a specific company
   */
  async getCompanyMentors(courseId: string, organizationId: string): Promise<Mentor[]> {
    return this.fetchWithErrorHandling(
      `/courses/${courseId}/organizations/${organizationId}/mentors`,
    );
  }

  /**
   * Get all interns assigned to a specific company
   */
  async getCompanyInterns(courseId: string, organizationId: string): Promise<Intern[]> {
    return this.fetchWithErrorHandling(
      `/courses/${courseId}/organizations/${organizationId}/interns`,
    );
  }

  /**
   * Assign multiple mentors to a company at once
   */
  async assignMultipleMentorsToCompany(
    courseId: string,
    organizationId: string,
    mentorIds: string[],
  ): Promise<void> {
    const promises = mentorIds.map((mentorId) =>
      this.assignMentorToOrganization(courseId, organizationId, mentorId),
    );
    await Promise.all(promises);
  }
}

export const apiService = new ApiService();
