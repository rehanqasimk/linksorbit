'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AccountOverview from '@/components/dashboard/AccountOverview';
import AccountNotifications from '@/components/dashboard/AccountNotifications';
import TopProgramsByClick from '@/components/dashboard/TopProgramsByClick';
import TopCountryByClick from '@/components/dashboard/TopCountryByClick';
import WeeklyPerformance from '@/components/dashboard/WeeklyPerformance';
import ProgramReport from '@/components/dashboard/ProgramReport';
import MetricsCards from '@/components/dashboard/MetricsCards';
import DetailedStatistics from '@/components/dashboard/DetailedStatistics';

export default function Dashboard() {
  const { data: session, status } = useSession({ required: true });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Set default date range: 30 days ago to today
  useEffect(() => {
    if (endDate === '') {
      // Default end date to today
      setEndDate(new Date().toISOString().split('T')[0]);
    }
    
    if (startDate === '') {
      // Default start date to 30 days before today
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    }
  }, [startDate, endDate]);

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {session?.user?.name || 'Publisher'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Start Date:
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate} // Can't select start date after end date
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-600 dark:text-gray-400">
              End Date:
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate} // Can't select end date before start date
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="mb-8">
        <MetricsCards startDate={startDate} endDate={endDate} />
      </div>
      
      {/* Detailed Statistics */}
      <div className="mb-8">
        <DetailedStatistics startDate={startDate} endDate={endDate} />
      </div>
      
      {/* Main Content */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccountOverview />
        <AccountNotifications />
        <WeeklyPerformance />
        <TopProgramsByClick />
        <TopCountryByClick />
        <ProgramReport />
      </div> */}
    </>

    // <div className='text-gray-900'>
    //   Dashboard
    // </div>
  );
}
