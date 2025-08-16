"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface Commission {
  id: string;
  advertiserName: string;
  commission: number;
  state: string;
  date: string;
  ykTag: string | null;
  advertiserId: string;
  modified_date: string;
  orderId: string | null;
  currency: string;
  amount: number;
  commissionType: string;
  payoutId: string | null;
  clickCountryCode: string;
  siteId: string;
}

interface ReportResponse {
  self: string;
  next: string;
  content: Commission[];
  page_size: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'modified'>('sales');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '2025-07-01',
    endDate: '2025-07-22',
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportResponse | null>(null);

  const fetchReport = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/${activeTab}?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`
      );
      if (!res.ok) throw new Error('Failed to fetch report');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <div className="flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>
              <Link href="/programs" className="text-white hover:text-gray-300">Programs</Link>
              <Link href="/reports" className="text-white hover:text-gray-300 font-bold">Reports</Link>
              <Link href="/incentives" className="text-white hover:text-gray-300">Incentives</Link>
            </nav>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => {
              setActiveTab('sales');
              setData(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            Sales
          </button>
          <button
            onClick={() => {
              setActiveTab('modified');
              setData(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'modified'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            Modified
          </button>
        </div>

        <form onSubmit={fetchReport} className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-neutral-900 p-6 rounded-xl shadow">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="border rounded px-3 py-2 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="border rounded px-3 py-2 focus:outline-none focus:ring"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Fetch Report'}
              </button>
            </div>
          </div>
        </form>

        {data && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Advertiser
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Country
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {data.content.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{item.advertiserName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {item.advertiserId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(item.commission, item.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStateColor(
                            item.state
                          )}`}
                        >
                          {item.state}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>{formatDate(item.date)}</div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Modified: {formatDate(item.modified_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(item.amount, item.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-800">
                          {item.clickCountryCode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-800 px-6 py-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {data.content.length} results • Page Size: {data.page_size}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
