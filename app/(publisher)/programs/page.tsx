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

      console.log("Fetched programs:", data);

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
    <div className="bg-gradient-to-b from-blue-50/50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-indigo-950/10 dark:to-gray-950 min-h-screen px-4 py-6">
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

      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Filter Programs</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <select
                id="country"
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 pl-10 w-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setPage(1); // Reset page when changing country
                }}
              >
                <option value="DE">Germany</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="FR">France</option>
                <option value="ES">Spain</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <select
                  id="category"
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 pl-10 w-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 p-12 rounded-2xl text-center shadow-inner">
          <p className="text-xl text-gray-600 dark:text-gray-400">No programs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPrograms.map(program => (
            <div 
              key={program.id} 
              className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 w-full flex flex-col md:flex-row"
              onClick={(e) => {
                // Check if click came from a child link or button
                // @ts-ignore - dataset is available on the target
                if (e.target.closest('a, button') || e.target.dataset.noModalTrigger) {
                  return; // Don't open the modal if clicked on a link or button
                }
                
                // Only open modal for approved programs with tracking links
                if (program.joinStatus === 'APPROVED' && program.trackinglink) {
                  setModalProgram(program);
                }
              }}
            >
              <div className="w-full md:w-56 h-36 md:h-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-900/20 flex items-center justify-center relative shrink-0 border-r border-gray-100 dark:border-gray-700">
                {program.image ? (
                  <Image 
                    src={program.image} 
                    alt={program.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, 200px"
                    className="object-contain p-4 hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to placeholder
                      const target = e.target as HTMLImageElement;
                      if (target) target.src = '/logo-placeholder.svg';
                    }}
                  />
                ) : (
                  <Image 
                    src="/logo-placeholder.svg" 
                    alt="Placeholder" 
                    fill
                    sizes="(max-width: 768px) 100vw, 200px"
                    className="object-contain p-4 opacity-75"
                  />
                )}
              </div>
              
              <div className="p-6 flex-grow flex flex-col md:flex-row bg-gradient-to-b from-transparent to-white/50 dark:to-gray-800/50">
                <div className="flex-grow pr-4">
                  <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-100 dark:to-white bg-clip-text text-transparent">{program.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    {program.domain || 'No domain available'}
                  </p>
                  
                  {program.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                      {program.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {program.categories && program.categories.map(category => (
                      <span 
                        key={category} 
                        className="inline-block bg-gradient-to-r from-blue-100 to-indigo-50 text-blue-700 dark:from-blue-900/40 dark:to-indigo-900/30 dark:text-blue-200 text-xs px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    {program.payPerSale > 0 && (
                      <div className="text-sm bg-gradient-to-r from-green-100 to-green-50 text-green-800 dark:from-green-900/30 dark:to-green-900/10 dark:text-green-300 px-3 py-1.5 rounded-lg flex items-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Sale:</span> <span className="ml-1 font-bold">{program.payPerSale} {program.currency}</span>
                      </div>
                    )}
                    {program.payPerLead > 0 && (
                      <div className="text-sm bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 dark:from-purple-900/30 dark:to-purple-900/10 dark:text-purple-300 px-3 py-1.5 rounded-lg flex items-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium">Lead:</span> <span className="ml-1 font-bold">{program.payPerLead} {program.currency}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center md:items-start justify-between md:justify-end md:min-w-[170px] md:pl-4 md:border-l md:border-gray-100 dark:md:border-gray-700">
                  {program.joinStatus === 'PENDING' ? (
                    <span className="inline-flex items-center bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pending Approval
                    </span>
                  ) : program.joinStatus === 'APPROVED' ? (
                    <div className="flex flex-col items-end gap-2">
                      <span className="inline-flex items-center bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200 text-xs px-4 py-2 rounded-full border border-green-200 dark:border-green-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Joined
                      </span>
                      {program.trackinglink && (
                        <div 
                          className="flex gap-2 mt-1"
                          onClick={(e) => {
                            // Stop click from reaching the parent card
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                          }}
                        >
                          <a 
                            href="#"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-xs flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              
                              // Open in new tab
                              window.open(program.trackinglink, '_blank', 'noopener,noreferrer');
                              return false;
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Tracking Link
                          </a>
                          <button
                            type="button"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full p-1.5 transition-colors"
                            onClick={(e) => {
                              // Ensure both stopPropagation and preventDefault
                              e.stopPropagation();
                              e.preventDefault();
                              
                              try {
                                navigator.clipboard.writeText(program.trackinglink || '');
                                setNotification({
                                  message: 'Tracking link copied to clipboard!',
                                  type: 'success'
                                });
                                setTimeout(() => setNotification(null), 3000);
                              } catch (err) {
                                console.error('Failed to copy:', err);
                              }
                              
                              return false;
                            }}
                            title="Copy tracking link to clipboard"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : program.joinStatus === 'REJECTED' ? (
                    <span className="inline-flex items-center bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 text-xs px-4 py-2 rounded-full border border-red-200 dark:border-red-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Rejected
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinProgram(program.id);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow flex items-center text-sm font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Join Program
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <nav className="inline-flex rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-5 py-3 border ${
                page === 1 
                ? 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
              } transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <span className="relative inline-flex items-center px-6 py-3 border-t border-b bg-gray-50 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
              Page <span className="font-bold mx-1 text-blue-600 dark:text-blue-400">{page}</span> of <span className="font-bold mx-1">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`relative inline-flex items-center px-5 py-3 border ${
                page === totalPages 
                ? 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
              } transition-colors duration-200`}
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}

      {/* Tracking Link Modal */}
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
  );
}
