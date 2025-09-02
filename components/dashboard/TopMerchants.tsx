'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ExternalLink, ArrowUpDown, X, Link as LinkIcon, Copy, Check } from 'lucide-react';
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
  category?: string;
}

interface MerchantSummary {
  merchantName: string;
  merchantId: string;
  totalCommission: number;
  currency: string;
  category: string;
  rank: number;
}

const TopMerchants = () => {
  const { data: session } = useSession();
  const [merchants, setMerchants] = useState<MerchantSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [maxResults] = useState<number>(10); // Show top 10 merchants
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantSummary | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchTopMerchants = async () => {
      setLoading(true);
      setError(null);

      // Get data for the last 6 months
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const formattedStartDate = startDate.toISOString().split('T')[0];
      
      try {
        const res = await fetch(`/api/reports/modified?start_date=${formattedStartDate}&end_date=${endDate}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Error fetching merchant data: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.content && data.content.length > 0) {
          // Only include transactions with OPEN or CONFIRMED status
          const validTransactions = data.content.filter((transaction: Transaction) => 
            transaction.state === 'OPEN' || transaction.state === 'CONFIRMED'
          );
          
          // Group transactions by merchant and sum commissions
          const merchantMap = new Map<string, MerchantSummary>();
          
          validTransactions.forEach((transaction: Transaction) => {
            const { advertiserId, advertiserName, commission, currency } = transaction;
            
            if (merchantMap.has(advertiserId)) {
              const merchant = merchantMap.get(advertiserId)!;
              merchant.totalCommission += commission;
            } else {
              // Determine category (simplified for demo)
              let category = 'Other';
              const name = advertiserName.toLowerCase();
              
              if (name.includes('fashion') || name.includes('clothing') || name.includes('wear') || name.includes('apparel')) {
                category = 'Clothing';
              } else if (name.includes('health') || name.includes('beauty') || name.includes('skincare') || name.includes('care')) {
                category = 'Health';
              } else if (name.includes('home') || name.includes('garden') || name.includes('furniture') || name.includes('decor')) {
                category = 'Home & Garden';
              } else if (name.includes('tech') || name.includes('electronics') || name.includes('gadget')) {
                category = 'Electronics';
              }
              
              merchantMap.set(advertiserId, {
                merchantName: advertiserName,
                merchantId: advertiserId,
                totalCommission: commission,
                currency: currency,
                category: category,
                rank: 0
              });
            }
          });
          
          // Convert to array, sort by commission (descending) and assign rank
          const sortedMerchants = Array.from(merchantMap.values())
            .sort((a, b) => b.totalCommission - a.totalCommission)
            .map((merchant, index) => ({
              ...merchant,
              rank: index + 1
            }));
          
          // Limit to the top specified merchants
          setMerchants(sortedMerchants.slice(0, maxResults));
        } else {
          setMerchants([]);
        }
      } catch (err) {
        console.error('Error fetching top merchants:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch top merchants');
      } finally {
        setLoading(false);
      }
    };

    fetchTopMerchants();
  }, [maxResults]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Function to open the modal and generate a tracking link
  const openTrackingLinkModal = (merchant: MerchantSummary) => {
    setSelectedMerchant(merchant);
    
    // Generate a sample tracking link (in a real app, this would call an API)
    const baseUrl = "https://track.yieldkit.com/";
    const publisherId = session?.user?.siteId || "demo-publisher";
    const generatedLink = `${baseUrl}?publisher=${publisherId}&merchant=${merchant.merchantId}&campaign=dashboard`;
    
    setGeneratedLink(generatedLink);
    setLinkCopied(false);
    setIsModalOpen(true);
  };
  
  // Function to copy the generated link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Your Top Merchants</h2>
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
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-400 ">Your Top Merchants</h2>
        <Link href="/programs" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
          View All Programs
          <ExternalLink className="h-3.5 w-3.5 ml-1" />
        </Link>
      </div>
      
      {loading ? (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="w-1/3 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-1/5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-1/5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-750 text-left">
              <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3 font-medium w-16 text-center">#</th>
                <th className="px-6 py-3 font-medium">Merchant</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium text-right">Commissions to Date</th>
                <th className="px-6 py-3 font-medium w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {merchants.length > 0 ? (
                merchants.map((merchant) => (
                  <tr 
                    key={merchant.merchantId} 
                    className="text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-center font-medium">
                      <div className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full text-white
                        ${merchant.rank <= 3 ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-400 dark:bg-gray-600'}
                      `}>
                        {merchant.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {merchant.merchantName}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {merchant.merchantId.substring(0, 6)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {merchant.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {formatCurrency(merchant.totalCommission, merchant.currency)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => openTrackingLinkModal(merchant)}
                        className="inline-block px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 hover:text-indigo-700 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-800/30 dark:hover:text-indigo-300 transition-colors"
                      >
                        Get Links
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No merchant data available yet.
                    <p className="mt-2 text-sm">Start promoting products to see your top merchants here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Tracking Link Modal */}
      {isModalOpen && selectedMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Tracking Link for {selectedMerchant.merchantName}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Use this tracking link to promote products from {selectedMerchant.merchantName} and earn commissions.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 flex items-center gap-2">
                  <LinkIcon className="text-gray-400 dark:text-gray-500 shrink-0 w-4 h-4" />
                  <div className="overflow-x-auto text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-nowrap">
                    {generatedLink}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <Link 
                  href={`/program/${selectedMerchant.merchantId}`}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  More Link Options
                </Link>
                
                <button
                  onClick={copyLinkToClipboard}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopMerchants;
