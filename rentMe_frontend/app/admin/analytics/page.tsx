'use client';

import { Analytics } from '@/components/admin/analytics';

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
        <p className="mt-2 text-gray-600">
          Platform metrics, user statistics, and revenue insights.
        </p>
      </div>

      <Analytics />
    </div>
  );
}
