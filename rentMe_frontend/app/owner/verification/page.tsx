'use client';

import { Verification } from '@/components/owner/verification';

export default function OwnerVerificationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Verification</h2>
        <p className="mt-2 text-gray-600">
          Submit documents for vehicle owner verification.
        </p>
      </div>

      <Verification />
    </div>
  );
}
