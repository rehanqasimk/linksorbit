'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DollarSign, RefreshCw, Calendar } from 'lucide-react';

interface Commission {
  id: string;
  commission: number;
  state: string;
  currency: string;
}

interface CurrentBalanceProps {
  // No longer using passed props for dates
}

const CurrentBalance: React.FC<CurrentBalanceProps> = () => {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{startDate: string, endDate: string}>({
    startDate: '', // Will be set to account creation date
    endDate: new Date().toISOString().split('T')[0] // Current date
  });

  // Fetch user's account creation date
  useEffect(() => {
    const fetchUserCreationDate = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) {
          console.error('Failed to fetch user profile');
          return;
        }
        
        const userData = await res.json();
        
        if (userData.createdAt) {
          // Format the date to YYYY-MM-DD
          const creationDate = new Date(userData.createdAt).toISOString().split('T')[0];
          setDateRange(prev => ({ ...prev, startDate: creationDate }));
        } else {
          // Fallback: use 30 days ago
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          setDateRange(prev => ({ ...prev, startDate: thirtyDaysAgo.toISOString().split('T')[0] }));
        }
      } catch (err) {
        console.error('Error fetching user creation date:', err);
        // Fallback: use 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        setDateRange(prev => ({ ...prev, startDate: thirtyDaysAgo.toISOString().split('T')[0] }));
      }
    };
    
    fetchUserCreationDate();
  }, []);

  // Fetch balance when dateRange changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!dateRange.startDate || !dateRange.endDate) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/reports/modified?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Error fetching balance: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Calculate total balance from confirmed and open commissions
        let total = 0;
        let primaryCurrency = 'USD'; // Default currency
        
        if (data.content && data.content.length > 0) {
          // Filter commissions with state "OPEN" or "CONFIRMED"
          const validCommissions = data.content.filter((commission: Commission) => 
            commission.state === 'OPEN' || commission.state === 'CONFIRMED'
          );
          
          if (validCommissions.length > 0) {
            // Set currency based on the first valid commission
            primaryCurrency = validCommissions[0].currency;
            
            // Sum up the commissions
            total = validCommissions.reduce((sum: number, commission: Commission) => 
              commission.currency === primaryCurrency ? sum + commission.commission : sum, 0
            );
          }
        }
        
        setBalance(total);
        setCurrency(primaryCurrency);
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [dateRange.startDate, dateRange.endDate]);

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Current Balance</h2>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Current Balance</h2>
        {loading && <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
          <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending + Confirmed</p>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? 
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div> : 
                new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(balance)
              }
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
        <Calendar className="w-4 h-4 mr-1" />
        <span>
          {dateRange.startDate ? 
            `Since ${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}` : 
            'Loading date range...'
          }
        </span>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>* Balance includes all open and confirmed commissions since your account creation.</p>
        <p>* Rejected commissions are not included in this total.</p>
      </div>
    </div>
  );
};

export default CurrentBalance;
