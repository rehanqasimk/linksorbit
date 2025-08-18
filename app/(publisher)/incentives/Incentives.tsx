"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface Incentive {
  id: string;
  advertiserId: string;
  advertiser: string;
  advertiserDomain: string;
  image: string;
  countries: string[];
  categories: string[];
  description?: string;
  name: string;
  code: string;
  validFrom: string;
  validTo: string;
  trackingLink: string;
}

interface IncentivesResponse {
  total: number;
  size: number;
  page: number;
  incentives: Incentive[];
}

const Incentives: React.FC = () => {
  const [siteId, setSiteId] = useState('12eafe68f1fa43d5ab3a745a173a7837');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IncentivesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchIncentives = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `/api/incentives?site_id=${siteId}&page_size=${pageSize}&page=${page}`
      );
      if (!res.ok) throw new Error('Failed to fetch incentives');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Incentives</h1>
          <div className="flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>
              <Link href="/programs" className="text-white hover:text-gray-300">Programs</Link>
              <Link href="/reports" className="text-white hover:text-gray-300">Reports</Link>
              <Link href="/incentives" className="text-white hover:text-gray-300 font-bold">Incentives</Link>
            </nav>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <form onSubmit={fetchIncentives} className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-neutral-900 p-6 rounded-xl shadow">
            <div>
              <label className="block text-sm font-medium mb-1">Site ID</label>
              <input
                type="text"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Page Size</label>
              <input
                type="number"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded px-3 py-2 focus:outline-none focus:ring w-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Page</label>
              <input
                type="number"
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="border rounded px-3 py-2 focus:outline-none focus:ring w-24"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Fetch'}
              </button>
            </div>
          </div>
        </form>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {data && (
          <div>
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <div className="bg-blue-50 dark:bg-neutral-800 rounded-lg px-4 py-2 text-lg font-medium">
                Total: {data.total}
              </div>
              <div className="bg-blue-50 dark:bg-neutral-800 rounded-lg px-4 py-2 text-lg font-medium">
                Page: {data.page}
              </div>
              <div className="bg-blue-50 dark:bg-neutral-800 rounded-lg px-4 py-2 text-lg font-medium">
                Size: {data.size}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.incentives.map((incentive) => (
                <div
                  key={incentive.id}
                  className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={incentive.image}
                      alt={incentive.advertiser}
                      className="w-16 h-16 object-contain rounded bg-neutral-100 dark:bg-neutral-800"
                    />
                    <div>
                      <h2 className="font-bold text-lg">{incentive.advertiser}</h2>
                      <a
                        href={`https://${incentive.advertiserDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {incentive.advertiserDomain}
                      </a>
                    </div>
                  </div>

                  {incentive.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {incentive.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {incentive.countries.map((country) => (
                      <span
                        key={country}
                        className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded"
                      >
                        {country}
                      </span>
                    ))}
                  </div>

                  {incentive.code && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Code:</span>
                      <code className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded font-mono">
                        {incentive.code}
                      </code>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Valid From:</span>
                      <span>{formatDate(incentive.validFrom)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Valid To:</span>
                      <span>{formatDate(incentive.validTo)}</span>
                    </div>
                  </div>

                  <a
                    href={incentive.trackingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                  >
                    Get Deal
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Incentives;
