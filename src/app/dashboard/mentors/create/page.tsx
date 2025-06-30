'use client';

import { MentorForm } from '@/components/forms/mentor-form';

export default function CreateMentorPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <MentorForm mode="create" />
    </div>
  );
}
