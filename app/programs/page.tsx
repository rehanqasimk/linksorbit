'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Programs</h1>
          <div className="flex space-x-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
            <Link href="/reports" className="text-blue-600 hover:text-blue-800">Reports</Link>
            <Link href="/incentives" className="text-blue-600 hover:text-blue-800">Incentives</Link>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Programs</h1>
          <div className="flex space-x-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
            <Link href="/reports" className="text-blue-600 hover:text-blue-800">Reports</Link>
            <Link href="/incentives" className="text-blue-600 hover:text-blue-800">Incentives</Link>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Programs</h1>
        <div className="flex space-x-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
          <Link href="/reports" className="text-blue-600 hover:text-blue-800">Reports</Link>
          <Link href="/incentives" className="text-blue-600 hover:text-blue-800">Incentives</Link>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {notification && (
        <div className={`mb-4 p-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select
            id="country"
            className="border rounded p-2 w-40"
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
        </div>

        {categories.length > 0 && (
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              className="border rounded p-2 w-40"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-lg text-gray-600">No programs found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPrograms.map(program => (
            <div 
              key={program.id} 
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white w-full flex flex-col md:flex-row"
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
              <div className="w-full md:w-48 h-32 md:h-auto bg-gray-100 flex items-center justify-center relative shrink-0">
                {program.image ? (
                  <Image 
                    src={program.image} 
                    alt={program.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, 200px"
                    className="object-contain p-2"
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
                    className="object-contain p-2"
                  />
                )}
              </div>
              
              <div className="p-4 flex-grow flex flex-col md:flex-row">
                <div className="flex-grow pr-4">
                  <h3 className="text-lg font-semibold mb-1">{program.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {program.domain || 'No domain available'}
                  </p>
                  
                  {program.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {program.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {program.categories && program.categories.map(category => (
                      <span 
                        key={category} 
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    {program.payPerSale > 0 && (
                      <div className="text-sm">
                        <span className="font-semibold">Sale:</span> {program.payPerSale} {program.currency}
                      </div>
                    )}
                    {program.payPerLead > 0 && (
                      <div className="text-sm">
                        <span className="font-semibold">Lead:</span> {program.payPerLead} {program.currency}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center md:items-start justify-between md:justify-end md:min-w-[150px]">
                  {program.joinStatus === 'PENDING' ? (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded">
                      Pending Approval
                    </span>
                  ) : program.joinStatus === 'APPROVED' ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded">
                        Joined
                      </span>
                      {program.trackinglink && (
                        <div 
                          className="flex gap-1"
                          onClick={(e) => {
                            // Stop click from reaching the parent card
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                          }}
                        >
                          <a 
                            href="#"
                            className="text-blue-600 hover:text-blue-800 text-xs underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              
                              // Open in new tab
                              window.open(program.trackinglink, '_blank', 'noopener,noreferrer');
                              return false;
                            }}
                          >
                            Tracking Link
                          </a>
                          <button
                            type="button"
                            className="text-gray-600 hover:text-gray-800 text-xs"
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
                            📋
                          </button>
                        </div>
                      )}
                    </div>
                  ) : program.joinStatus === 'REJECTED' ? (
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-3 py-1 rounded">
                      Rejected
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinProgram(program.id);
                      }}
                      className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Join
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
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
                page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border-t border-b bg-white text-sm font-medium text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
                page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
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
