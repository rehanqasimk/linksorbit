"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Calendar, Download, Filter, Info, RefreshCw, ChevronDown, AlertCircle, ArrowUpDown } from "lucide-react";

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
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'sales' | 'modified'>('sales');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '2025-07-01',
    endDate: '2025-07-22',
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportResponse | null>(null);
  const [sortBy, setSortBy] = useState<'sales_date' | 'modified_date' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const fetchReport = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!session?.user?.siteId) {
      alert("No site ID available. Please contact support.");
      return;
    }
    
    setLoading(true);
    setSortBy(activeTab === 'sales' ? 'sales_date' : 'modified_date');
    setSortDirection('desc');
    
    try {
      const res = await fetch(
        `/api/reports/${activeTab}?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch report');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'An error occurred while fetching the report');
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      case 'open':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
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
  
  const isRecentlyModified = (salesDate: string, modifiedDate: string) => {
    const salesDateTime = new Date(salesDate).getTime();
    const modifiedDateTime = new Date(modifiedDate).getTime();
    const daysDiff = (modifiedDateTime - salesDateTime) / (1000 * 60 * 60 * 24);
    return daysDiff > 0 && daysDiff < 7; // Modified within the last 7 days after sale
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            View and analyze your commission data based on sales or modification dates
          </p>
        </div>
        
        {/* Site ID Warning */}
        {!session?.user?.siteId && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Your account does not have a site ID assigned. Contact support to get access to reports.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm">
            <div className="relative">
              <button
                onClick={() => {
                  setActiveTab('sales');
                  setData(null);
                  setSortBy('sales_date');
                }}
                className={`px-5 py-2.5 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'sales'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Sales Date
              </button>
              <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-xs text-white rounded-md p-2 w-48 -left-8 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                When the actual purchase happened
                <div className="absolute h-2 w-2 bg-gray-800 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setActiveTab('modified');
                  setData(null);
                  setSortBy('modified_date');
                }}
                className={`px-5 py-2.5 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'modified'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                Modified Date
              </button>
              <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-xs text-white rounded-md p-2 w-48 -left-16 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                When a commission event was last updated
                <div className="absolute h-2 w-2 bg-gray-800 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 dark:bg-gray-750 border-b dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4" />
              <h3 className="font-medium">Report Filters</h3>
            </div>
          </div>
          
          <form onSubmit={fetchReport} className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Start Date
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="block w-full px-3 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 text-sm"
                  />
                  <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    End Date
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className="block w-full px-3 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 text-sm"
                  />
                  <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Fetch Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Report context summary */}
        {data && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 bg-indigo-50 dark:bg-indigo-900/30 border-b dark:border-gray-700 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <h3 className="font-medium text-indigo-700 dark:text-indigo-300 text-sm">Report Summary</h3>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="font-medium text-gray-700 dark:text-gray-300">Report Type:</div>
                    <div className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-medium">
                      {activeTab === 'sales' ? 'Sales Date Report' : 'Modified Date Report'}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="font-medium text-gray-700 dark:text-gray-300">Date Range:</div>
                    <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="font-medium text-gray-700 dark:text-gray-300">Site ID:</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {session?.user?.siteId || "Not available"}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 md:border-l md:border-gray-100 md:dark:border-gray-700 md:pl-6">
                  <div className="flex flex-col">
                    <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Sort Options:</div>
                    <div className="relative">
                      <select
                        value={`${sortBy || 'none'}-${sortDirection}`}
                        onChange={(e) => {
                          const [newSortBy, newDirection] = e.target.value.split('-');
                          setSortBy(newSortBy === 'none' ? null : (newSortBy as 'sales_date' | 'modified_date'));
                          setSortDirection(newDirection as 'asc' | 'desc');
                        }}
                        className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="none-desc">Default</option>
                        <option value="sales_date-desc">Sales Date (Newest First)</option>
                        <option value="sales_date-asc">Sales Date (Oldest First)</option>
                        <option value="modified_date-desc">Modified Date (Newest First)</option>
                        <option value="modified_date-asc">Modified Date (Oldest First)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {activeTab === 'sales' 
                        ? 'Sales date is when the actual purchase happened' 
                        : 'Modified date is when a commission event was last updated'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {data && data.content.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Advertiser
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th 
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer group"
                      onClick={() => {
                        if (sortBy === (activeTab === 'sales' ? 'sales_date' : 'modified_date')) {
                          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy(activeTab === 'sales' ? 'sales_date' : 'modified_date');
                          setSortDirection('desc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>{activeTab === 'sales' ? 'Sales Date' : 'Modified Date'}</span>
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Country
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(sortBy 
                    ? [...data.content].sort((a, b) => {
                        const dateA = new Date(sortBy === 'sales_date' ? a.date : a.modified_date);
                        const dateB = new Date(sortBy === 'sales_date' ? b.date : b.modified_date);
                        return sortDirection === 'asc' 
                          ? dateA.getTime() - dateB.getTime() 
                          : dateB.getTime() - dateA.getTime();
                      }) 
                    : data.content
                  ).map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{item.advertiserName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ID: {item.advertiserId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.commission, item.currency)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${getStateColor(
                            item.state
                          )}`}
                        >
                          {item.state}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {activeTab === 'sales' ? (
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{formatDate(item.date)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap">
                              <span>Modified: {formatDate(item.modified_date)}</span>
                              {isRecentlyModified(item.date, item.modified_date) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Recently Updated
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{formatDate(item.modified_date)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap">
                              <span>Sales: {formatDate(item.date)}</span>
                              {isRecentlyModified(item.date, item.modified_date) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Recently Updated
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.amount, item.currency)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {item.clickCountryCode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-750 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Showing {data.content.length} results • Page Size: {data.page_size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-650 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export
                  </button>
                  <div className="px-3 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {activeTab === 'sales' 
                      ? 'Reporting based on Sales Date'
                      : 'Reporting based on Modified Date'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : data && data.content.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-10 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3">
                <AlertCircle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No results found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                No commission data available for the selected date range and filters.
                Try adjusting your search criteria.
              </p>
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Empty state when no data is loaded yet */}
      {!data && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-16 text-center mt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-indigo-50 dark:bg-indigo-900/20 p-4">
              <RefreshCw className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">Generate Your Report</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Select your filters above and click "Fetch Report" to view your commission data.
              Reports are available based on sales dates or modification dates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
