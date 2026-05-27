'use client';

import { VerificationQueue } from '@/components/admin/verification-queue';

export default function AdminVerificationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Verification Queue</h2>
        <p className="mt-2 text-gray-600">
          Review and approve vehicle owner verification requests.
        </p>
      </div>

      <VerificationQueue />
    </div>
  );
}
