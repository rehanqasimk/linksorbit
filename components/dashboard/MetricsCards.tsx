'use client';

import { useEffect, useState } from 'react';

interface MetricsCardProps {
  label: string;
  value: string | number;
  isLoading: boolean;
}

interface DashboardStats {
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

function MetricCard({ label, value, isLoading }: MetricsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      {isLoading ? (
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
      ) : (
        <div className="text-xl font-semibold mt-1 text-gray-900 dark:text-white">{value}</div>
      )}
    </div>
  );
}

export default function MetricsCards({ startDate, endDate }: { startDate?: string, endDate?: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Construct URL with date parameters if provided
        let url = '/api/dashboard';
        if (startDate && endDate) {
          url += `?start_date=${startDate}&end_date=${endDate}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data.content && data.data.content.length > 0) {
          // If we have a user site ID, try to find that specific site's statistics
          if (userSiteId) {
            const userSite = data.data.content.find(
              (site: {value: string}) => site.value === userSiteId
            );
            
            if (userSite) {
              // Use the user's site statistics
              setStats(userSite.statistic);
            } else {
              // If user's site not found, use the first site's statistics
              setStats(data.data.content[0].statistic);
            }
          } else {
            // No user site ID, use the first site's statistics
            setStats(data.data.content[0].statistic);
          }
        } else {
          throw new Error('No dashboard data available');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Set empty stats to avoid undefined errors
        setStats({
          clicks_forwarded: 0,
          clicks_untracked: 0,
          clicks_blocked: 0,
          paid_commissions: 0,
          confirmed_commissions: 0,
          open_commissions: 0,
          delayed_commissions: 0,
          rejected_commissions: 0,
          total_commission: 0
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [startDate, endDate, userSiteId]);

  // Calculate total clicks
  const totalClicks = stats ? 
    stats.clicks_forwarded + stats.clicks_untracked + stats.clicks_blocked : 0;
  
  // Calculate total conversions
  const totalConversions = stats ? 
    stats.paid_commissions + stats.confirmed_commissions + 
    stats.open_commissions + stats.delayed_commissions : 0;
  
  // Calculate conversion rate
  const conversionRate = totalClicks > 0 ? 
    ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <p className="font-medium">Error loading dashboard data</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard 
          label="Total Clicks" 
          value={totalClicks.toLocaleString()}
          isLoading={isLoading}
        />
        <MetricCard 
          label="Conversions" 
          value={totalConversions.toLocaleString()}
          isLoading={isLoading}
        />
        <MetricCard 
          label="Conversion Rate" 
          value={`${conversionRate}%`}
          isLoading={isLoading}
        />
        <MetricCard 
          label="Confirmed Commission" 
          value={stats ? stats.confirmed_commissions.toLocaleString() : '0'}
          isLoading={isLoading}
        />
        <MetricCard 
          label="Open Commission" 
          value={stats ? stats.open_commissions.toLocaleString() : '0'}
          isLoading={isLoading}
        />
        <MetricCard 
          label="Total Commission" 
          value={stats ? formatCurrency(stats.total_commission) : '$0.00'}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
