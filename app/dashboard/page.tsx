'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import AccountOverview from '@/components/dashboard/AccountOverview';
import AccountNotifications from '@/components/dashboard/AccountNotifications';
import TopProgramsByClick from '@/components/dashboard/TopProgramsByClick';
import TopCountryByClick from '@/components/dashboard/TopCountryByClick';
import WeeklyPerformance from '@/components/dashboard/WeeklyPerformance';
import ProgramReport from '@/components/dashboard/ProgramReport';
import MetricsCards from '@/components/dashboard/MetricsCards';
import SiteIdCard from '@/components/dashboard/SiteIdCard';

export default function Dashboard() {
  const { data: session } = useSession();
  const [dateRange, setDateRange] = useState('');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome Back, {session?.user?.name || 'Publisher'}
            </h1>
            <input
              type="date"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="mt-2 bg-gray-800 text-white px-3 py-1 rounded border border-gray-700"
            />
          </div>
          <nav className="flex space-x-6">
            <Link href="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>
            <Link href="/programs" className="text-white hover:text-gray-300">Programs</Link>
            <Link href="/reports" className="text-white hover:text-gray-300">Reports</Link>
            <Link href="/payments" className="text-white hover:text-gray-300">Payments</Link>
          </nav>
        </div>

        {/* Metrics Cards */}
        <MetricsCards />
        
        {/* Site ID Card (for publishers) */}
        {session?.user?.role !== 'ADMIN' && <SiteIdCard />}

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Account Overview */}
          <div className="col-span-4">
            <AccountOverview />
          </div>

          {/* Account Notifications */}
          <div className="col-span-4">
            <AccountNotifications />
          </div>

          {/* Top Programs By Click */}
          <div className="col-span-4">
            <TopProgramsByClick />
          </div>

          {/* Weekly Performance */}
          <div className="col-span-8">
            <WeeklyPerformance />
          </div>

          {/* Top Country By Click */}
          <div className="col-span-4">
            <TopCountryByClick />
          </div>

          {/* Program Report */}
          <div className="col-span-12">
            <ProgramReport />
          </div>
        </div>
      </div>
    </div>
  );
}
