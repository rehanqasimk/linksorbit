'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
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

const RecentTransactions = () => {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      // Set date range to last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
      
      try {
        const res = await fetch(`/api/reports/modified?start_date=${startDate}&end_date=${endDate}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Error fetching transactions: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.content && data.content.length > 0) {
          // Sort by date, newest first
          const sortedTransactions = [...data.content].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          // Take only the 5 most recent transactions
          setTransactions(sortedTransactions.slice(0, 5));
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch recent transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Transactions</h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Recent Transactions</h2>
        <Link href="/reports" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center transition-colors duration-150 hover:underline">
          View All
          <ExternalLink className="h-3.5 w-3.5 ml-1 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      </div>
      
      {loading ? (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="w-1/4 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-1/5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-1/5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-1/4 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-750 text-left">
              <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Commission</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Advertiser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className="text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      {formatCurrency(transaction.amount, transaction.currency)} 
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        {transaction.commissionType === 'SALE' ? '(sale)' : '(affiliate payment)'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${transaction.commission > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {transaction.commission > 0 ? '+' : ''}
                      {formatCurrency(transaction.commission, transaction.currency)} 
                      <span className="text-gray-500 dark:text-gray-400 ml-1">(commission)</span>
                    </td>
                    <td className="px-6 py-4">{formatDate(transaction.date)}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{transaction.advertiserName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
