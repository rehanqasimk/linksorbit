'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TrackingLinkModal from '@/components/programs/TrackingLinkModal';

interface Program {
  id: string;
  name: string;
  description: string;
  image: string;
  domain: string;
  countries: string[];
  categories: string[];
  payPerLead: number;
  payPerSale: number;
  currency: string;
  trackinglink?: string;
  deeplink?: boolean;
  joinStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

export default function Programs() {
  const { data: session } = useSession();
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('DE');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [modalProgram, setModalProgram] = useState<Program | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    
    fetchPrograms();
  }, [session, selectedCategory, selectedCountry, page]);

  async function fetchPrograms() {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add country and pagination parameters
      const response = await fetch(`/api/programs?page=${page}&pageSize=10&country=${selectedCountry}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch programs');
      }
      
      const data = await response.json();

      console.log("😊 Fetched programs:", data);

      if (data && data.success && Array.isArray(data.programs)) {
        setPrograms(data.programs);
        // Calculate total pages based on total count and page size
        setTotalPages(Math.ceil((data.total || 0) / 10));
      } else {
        setPrograms([]);
        setError('Invalid response format from API');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoinProgram(programId: string) {
    try {
      const response = await fetch('/api/programs/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join program');
      }
      
      // Update local state to reflect the change
      setPrograms(programs.map(program => 
        program.id === programId ? { ...program, joinStatus: 'PENDING' } : program
      ));
      
      setNotification({
        message: 'Join request submitted successfully!',
        type: 'success'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
    } catch (err) {
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to join program',
        type: 'error'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  }

  // Extract unique categories and countries for filtering
  const categories = programs && programs.length > 0 
    ? [...new Set(programs.flatMap(program => program.categories || []))] 
    : [];
  
  const countries = programs && programs.length > 0 
    ? [...new Set(programs.flatMap(program => program.countries || []))] 
    : [];

  // Filter programs based on selected category
  const filteredPrograms = programs && programs.length > 0
    ? selectedCategory 
      ? programs.filter(program => program.categories && program.categories.includes(selectedCategory))
      : programs
    : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-l-3 border-blue-500"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading programs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md" role="alert">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <strong className="font-bold text-lg">Error Occurred</strong>
        </div>
        <p className="block sm:inline">{error}</p>
        <p className="mt-3 text-sm">Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {notification && (
          <div className={`mb-6 p-4 rounded-lg shadow-sm border ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' 
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
          } flex items-center`}>
            <div className={`rounded-full p-1 mr-3 ${
              notification.type === 'success' ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800'
            }`}>
              {notification.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore Programs</h1>
          <p className="mt-1 text-md text-gray-600 dark:text-gray-400">Discover and join programs to start earning.</p>
        </div>

        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Filter Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
              <div className="relative">
                <select
                  id="country"
                  className="w-full appearance-none block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="DE">Germany</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="FR">France</option>
                  <option value="ES">Spain</option>
                </select>
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <div className="relative">
                  <select
                    id="category"
                    className="w-full appearance-none block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No programs found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredPrograms.map(program => (
              <div 
                key={program.id} 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row"
              >
                <div className="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                  <div className="relative w-full h-full bg-gray-100 dark:bg-gray-700">
                    {program.image ? (
                      <Image 
                        src={program.image} 
                        alt={program.name} 
                        fill
                        sizes="(max-width: 640px) 100vw, 192px"
                        className="object-contain p-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target) target.src = '/logo-placeholder.svg';
                        }}
                      />
                    ) : (
                      <Image 
                        src="/logo-placeholder.svg" 
                        alt="Placeholder" 
                        fill
                        sizes="(max-width: 640px) 100vw, 192px"
                        className="object-contain p-4 opacity-50"
                      />
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{program.name}</h3>
                    <a href={`http://${program.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                      {program.domain}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {program.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {program.categories?.map(category => (
                        <span key={category} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300">{category}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {program.payPerSale > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          <span className="font-medium">Sale:</span> <span className="font-bold">{program.payPerSale} {program.currency}</span>
                        </div>
                      )}
                      {program.payPerLead > 0 && (
                        <div className="text-sm text-purple-600 dark:text-purple-400">
                          <span className="font-medium">Lead:</span> <span className="font-bold">{program.payPerLead} {program.currency}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      {program.joinStatus === 'PENDING' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                          Pending
                        </span>
                      ) : program.joinStatus === 'APPROVED' ? (
                        <div className="flex items-center gap-2">
                           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                            Joined
                          </span>
                          <button
                            onClick={() => setModalProgram(program)}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                          >
                            Get Link
                          </button>
                        </div>
                      ) : program.joinStatus === 'REJECTED' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                          Rejected
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJoinProgram(program.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow flex items-center text-sm font-medium"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}

        {modalProgram && (
          <TrackingLinkModal
            isOpen={!!modalProgram}
            onClose={() => setModalProgram(null)}
            program={{
              name: modalProgram.name,
              trackinglink: modalProgram.trackinglink || '',
              deeplink: modalProgram.deeplink
            }}
            onCopyLink={() => {
              setNotification({
                message: 'Tracking link copied to clipboard!',
                type: 'success'
              });
              setTimeout(() => setNotification(null), 3000);
            }}
          />
        )}
      </div>
    </div>
  );
}
