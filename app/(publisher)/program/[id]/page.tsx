'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import SafeImage from '@/components/SafeImage';
import TrackingLinkModal from '@/components/programs/TrackingLinkModal';
import Link from 'next/link';

interface Metric {
  description: string;
  country: string;
  currency: string;
  cpc: number | null;
  cr: number;
  commission: number;
}

interface Program {
  id: string;
  name: string;
  description: string;
  image: string;
  domain: string;
  url: string;
  countries: string[];
  categories: string[];
  payPerLead: number;
  payPerSale: number;
  currency: string;
  trackinglink?: string;
  deeplink?: boolean;
  autoRedirect: boolean;
  offerType: string;
  metrics: Metric[];
  joinStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

export default function ProgramDetails() {
  const { data: session } = useSession({ required: true });
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [joiningInProgress, setJoiningInProgress] = useState(false);
  
  useEffect(() => {
    if (!session) {
      return;
    }
    
    fetchProgramDetails();
  }, [session, programId]);

  async function fetchProgramDetails() {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/programs/${programId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch program details');
      }
      
      const data = await response.json();

      if (data && data.success && data.program) {
        setProgram(data.program);
      } else {
        setError('Invalid response format from API');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoinProgram() {
    if (!program) return;
    
    try {
      setJoiningInProgress(true);
      
      const response = await fetch('/api/programs/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programId: program.id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join program');
      }
      
      // Update local state to reflect the change
      setProgram({
        ...program,
        joinStatus: 'PENDING'
      });
      
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
    } finally {
      setJoiningInProgress(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-l-3 border-blue-500"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading program details...</p>
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

  if (!program) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg shadow-md" role="alert">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <strong className="font-bold text-lg">Program Not Found</strong>
        </div>
        <p className="block sm:inline">The requested program could not be found.</p>
        <div className="mt-4">
          <Link href="/programs" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
            Back to Programs
          </Link>
        </div>
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

        <div className="mb-6 flex items-center">
          <Link href="/programs" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Programs
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 lg:w-1/4">
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {program.image ? (
                    <SafeImage 
                      src={program.image} 
                      alt={program.name} 
                      fill
                      className="object-contain p-4"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const target = e.target as HTMLImageElement;
                        if (target) target.src = '/logo-placeholder.svg';
                      }}
                    />
                  ) : (
                    <SafeImage 
                      src="/logo-placeholder.svg" 
                      alt="Placeholder" 
                      fill
                      className="object-contain p-4 opacity-50"
                    />
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</h3>
                    <a 
                      href={program.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      {program.domain}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  {program.countries.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Countries</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {program.countries.map(country => (
                          <span key={country} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300">
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {program.categories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {program.categories.map(category => (
                          <span key={category} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Commission</h3>
                    <div className="mt-1 space-y-2">
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
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-2/3 lg:w-3/4 mt-6 md:mt-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{program.name}</h1>
                
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Description</h2>
                  <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                    {program.description ? (
                      <p>{program.description}</p>
                    ) : (
                      <p className="text-gray-400 italic">No description available.</p>
                    )}
                  </div>
                </div>

                {program.metrics && program.metrics.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Performance Metrics</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Country</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Currency</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CPC</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CR</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Commission</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {program.metrics.map((metric, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{metric.description}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{metric.country || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{metric.currency}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{metric.cpc || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{metric.cr}%</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{metric.commission}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Program Details</h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Offer Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{program.offerType}</dd>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Deeplink Support</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{program.deeplink ? 'Yes' : 'No'}</dd>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Auto Redirect</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{program.autoRedirect ? 'Yes' : 'No'}</dd>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Program ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{program.id}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  {program.joinStatus === 'PENDING' ? (
                    <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Join Request Pending
                    </div>
                  ) : program.joinStatus === 'APPROVED' ? (
                    <>
                      <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Joined
                      </div>
                      <button
                        onClick={() => setModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Get Tracking Link
                      </button>
                    </>
                  ) : program.joinStatus === 'REJECTED' ? (
                    <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Join Request Rejected
                    </div>
                  ) : (
                    <button
                      onClick={handleJoinProgram}
                      disabled={joiningInProgress}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        joiningInProgress 
                          ? 'bg-blue-500 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {joiningInProgress ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Joining Program...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Join Program
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {program.trackinglink && modalOpen && (
        <TrackingLinkModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          program={{
            name: program.name,
            trackinglink: program.trackinglink || '',
            deeplink: program.deeplink
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
