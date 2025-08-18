'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
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
    // <>
    //   <div className="mb-4">
    //     <p className="text-gray-600 dark:text-gray-400">
    //       Welcome back, {session?.user?.name || 'Publisher'}
    //     </p>
    //     <div className="flex items-center justify-end">
    //       <input
    //         type="date"
    //         value={dateRange}
    //         onChange={(e) => setDateRange(e.target.value)}
    //         className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm dark:bg-gray-800 dark:text-white"
    //       />
    //     </div>
    //   </div>
      
    //   {/* Metrics Cards */}
    //   <div className="mb-6">
    //     <MetricsCards dateRange={dateRange} />
    //   </div>
      
    //   {/* Site ID Card */}
    //   <div className="mb-6">
    //     <SiteIdCard userId={session?.user?.id} />
    //   </div>
      
    //   {/* Main Content */}
    //   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //     <AccountOverview />
    //     <AccountNotifications />
    //     <WeeklyPerformance />
    //     <TopProgramsByClick />
    //     <TopCountryByClick />
    //     <ProgramReport />
    //   </div>
    // </>

    <div className='text-gray-900'>
      Dashboard
    </div>
  );
}
