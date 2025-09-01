'use client';

import { useState, useEffect } from 'react';

interface StatisticDetail {
  clicks_forwarded: number;
  clicks_untracked: number;
  clicks_blocked: number;
  paid_commissions: number;
  confirmed_commissions: number;
  open_commissions: number;
  delayed_commissions: number;
  rejected_commissions: number;
  total_commission: number;
}

interface SiteStatistic {
  value: string; // site_id
  statistic: StatisticDetail;
}

interface DashboardResponse {
  self: string;
  next: string;
  total_pages: number;
  content: SiteStatistic[];
  page_size: number;
}

export default function DetailedStatistics({ startDate, endDate }: { startDate?: string, endDate?: string }) {
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSiteId, setUserSiteId] = useState<string | null>(null);

  // Fetch user's site ID on component mount
  useEffect(() => {
    async function fetchUserSiteId() {
      try {
        const response = await fetch('/api/user/profile');



  
        
        if (response.ok) {
          const data = await response.json();

          console.log("data",data);
          if (data.user && data.user.siteId) {
            setUserSiteId(data.user.siteId);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user site ID:", err);
      }
    }
    
    fetchUserSiteId();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let url = '/api/dashboard';
        if (startDate && endDate) {
          url += `?start_date=${startDate}&end_date=${endDate}`;
        }
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("🔴 detailed statistics data", data);
        setStats(data);
        setUserSiteId(data.siteId);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [startDate, endDate]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Detailed Statistics</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Detailed Statistics</h2>
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <p className="font-medium">Error loading statistics</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats || !stats.content || stats.content.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Detailed Statistics</h2>
        <p className="text-gray-600 dark:text-gray-400">No statistics available for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Detailed Statistics</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicks (Forwarded)</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicks (Untracked)</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicks (Blocked)</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid Commissions</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confirmed Commissions</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Open Commissions</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Commission</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {stats.content.map((site, index) => {
              const isUserSite = userSiteId && site.value === userSiteId;
              const rowClassName = isUserSite 
                ? 'bg-blue-50 dark:bg-blue-900/20' 
                : index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/20' : '';
              
              return (
                <tr key={index} className={rowClassName}>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {site.statistic.clicks_forwarded.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {site.statistic.clicks_untracked.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {site.statistic.clicks_blocked.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {site.statistic.paid_commissions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {site.statistic.confirmed_commissions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {site.statistic.open_commissions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <span className={isUserSite ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}>
                      {formatCurrency(site.statistic.total_commission)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Showing {stats.content.length} site(s) • Page {stats.total_pages > 1 ? '1 of ' + stats.total_pages : '1'}</p>
      </div>
    </div>
  );
}
