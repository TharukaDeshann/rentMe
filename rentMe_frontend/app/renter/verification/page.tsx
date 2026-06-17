'use client';

import { Verification } from '@/components/owner/verification';

export default function RenterVerificationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Become a Vehicle Owner</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Submit your verification documents to start listing your vehicles and earning with rentMe.
        </p>
      </div>

      <Verification />
    </div>
  );
}
