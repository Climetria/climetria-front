'use client';

import { CourseForm } from '@/components/forms/course-form';

export default function CreateCoursePage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <CourseForm mode="create" />
    </div>
  );
}
