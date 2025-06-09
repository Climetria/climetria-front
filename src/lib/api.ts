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
}

// Utilidad para leer cookies desde el cliente
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

      const responseData = await response.json();
      console.log('Response data:', responseData);
      return responseData;
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
    return this.fetchWithErrorHandling(`/courses/${courseId}/companies`);
  }

  async getCompany(courseId: string, companyId: string): Promise<Company> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/companies/${companyId}`);
  }

  async createCompany(courseId: string, companyData: Partial<Company>): Promise<Company> {
    // Asegurar que solo enviamos los campos necesarios para la creación
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

    return this.fetchWithErrorHandling(`/courses/${courseId}/companies`, {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
  }

  async updateCompany(
    courseId: string,
    companyId: string,
    companyData: Partial<Company>,
  ): Promise<Company> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/companies/${companyId}`, {
      method: 'PATCH',
      body: JSON.stringify(companyData),
    });
  }

  async deleteCompany(courseId: string, companyId: string): Promise<void> {
    return this.fetchWithErrorHandling(`/courses/${courseId}/companies/${companyId}`, {
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
}

export const apiService = new ApiService();
