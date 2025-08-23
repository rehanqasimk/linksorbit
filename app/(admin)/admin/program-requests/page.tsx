'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import SafeImage from '@/components/SafeImage';

interface User {
  id: string;
  name: string | null;
  email: string;
  siteId: string | null;
  website: string | null;
}

interface Program {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  domain: string | null;
  url: string | null;
  categories: string[];
}

interface ProgramRequest {
  id: string;
  userId: string;
  programId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  user: User;
  program: Program;
}

export default function ProgramRequests() {
  const { data: session } = useSession({ required: true });
  const [programRequests, setProgramRequests] = useState<ProgramRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [publisherFilter, setPublisherFilter] = useState<string>('');
  const [debouncedPublisherFilter, setDebouncedPublisherFilter] = useState<string>('');
  const [actionStatus, setActionStatus] = useState<{[key: string]: string}>({});
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchProgramRequests();
  }, [filter]);
  
  // Apply debouncing to the publisher filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPublisherFilter(publisherFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [publisherFilter]);

  const fetchProgramRequests = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'ALL' ? '' : `?status=${filter}`;
      const response = await fetch(`/api/programs/requests${statusParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch program requests');
      }
      
      const data = await response.json();
      
      setProgramRequests(data.programRequests);
    } catch (err: any) {
      console.error('Error fetching program requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setActionStatus(prev => ({ ...prev, [requestId]: 'LOADING' }));
      
      const response = await fetch(`/api/programs/request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${status.toLowerCase()} request`);
      }

      // Update the local state
      setProgramRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status } : req
        )
      );
      
      setActionStatus(prev => ({ ...prev, [requestId]: 'SUCCESS' }));
      
      // Set global notification
      const request = programRequests.find(req => req.id === requestId);
      const publisher = request?.user?.name || 'Publisher';
      const program = request?.program?.name || 'program';
      
      setNotification({
        message: `Successfully ${status.toLowerCase()} ${publisher}'s request to join ${program}`,
        type: 'success'
      });
      
      // Reset action status after a delay
      setTimeout(() => {
        setActionStatus(prev => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      }, 3000);
      
      // Reset notification after a delay
      setTimeout(() => {
        setNotification(null);
      }, 5000);
      
    } catch (err: any) {
      console.error(`Error ${status.toLowerCase()}ing request:`, err);
      setActionStatus(prev => ({ ...prev, [requestId]: 'ERROR' }));
      
      // Set global notification
      setNotification({
        message: `Failed to ${status.toLowerCase()} program request`,
        type: 'error'
      });
      
      // Reset action status after a delay
      setTimeout(() => {
        setActionStatus(prev => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      }, 3000);
      
      // Reset notification after a delay
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const filteredRequests = programRequests.filter(request => {
    // First apply status filter
    if (filter !== 'ALL' && request.status !== filter) {
      return false;
    }
    
    // Then apply publisher filter if it exists
    if (debouncedPublisherFilter.trim() !== '') {
      const userName = request.user.name?.toLowerCase() || '';
      const userEmail = request.user.email.toLowerCase();
      const siteId = request.user.siteId?.toLowerCase() || '';
      const searchTerm = debouncedPublisherFilter.toLowerCase();
      
      return userName.includes(searchTerm) || 
             userEmail.includes(searchTerm) || 
             siteId.includes(searchTerm);
    }
    
    return true;
  });

  if (!session || session.user?.role !== 'ADMIN') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You do not have permission to access this page.</p>
        <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Notification banner */}
      {notification && (
        <div className={`p-4 rounded-md mb-6 ${
          notification.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'
        } flex justify-between items-center`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-white ml-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Publisher Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Filter by publisher name or email..."
              value={publisherFilter}
              onChange={(e) => setPublisherFilter(e.target.value)}
            />
          </div>
          {publisherFilter && (
            <button
              className="p-2 text-gray-400 hover:text-white"
              onClick={() => setPublisherFilter('')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter indicator when publisher filter is active */}
      {debouncedPublisherFilter && (
        <div className="mt-4 mb-2">
          <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-900 text-indigo-300">
            Filtering by: {debouncedPublisherFilter}
            <button 
              onClick={() => setPublisherFilter('')}
              className="ml-2 text-indigo-300 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex -mb-px">
          <button 
            onClick={() => setFilter('PENDING')} 
            className={`mr-8 py-4 text-sm font-medium ${
              filter === 'PENDING' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('APPROVED')} 
            className={`mr-8 py-4 text-sm font-medium ${
              filter === 'APPROVED' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Approved
          </button>
          <button 
            onClick={() => setFilter('REJECTED')} 
            className={`mr-8 py-4 text-sm font-medium ${
              filter === 'REJECTED' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Rejected
          </button>
          <button 
            onClick={() => setFilter('ALL')} 
            className={`mr-8 py-4 text-sm font-medium ${
              filter === 'ALL' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            All Requests
          </button>
        </nav>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-900 text-white text-sm rounded">
          {error}
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            Loading program requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {debouncedPublisherFilter 
              ? `No ${filter === 'ALL' ? '' : filter.toLowerCase()} program requests found for "${debouncedPublisherFilter}".` 
              : `No ${filter === 'ALL' ? '' : filter.toLowerCase()} program requests found.`}
            {(debouncedPublisherFilter || filter !== 'ALL') && (
              <div className="mt-2">
                <button 
                  onClick={() => {
                    setPublisherFilter('');
                    setFilter('ALL');
                  }}
                  className="text-indigo-400 hover:text-indigo-300 text-sm underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Publisher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Site ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Categories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                          {request.user.name?.substring(0, 2).toUpperCase() || request.user.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{request.user.name || 'No Name'}</div>
                          <div className="text-sm text-gray-400">{request.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {request.user.siteId || 'No Site ID'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          {request.program.image ? (
                            <SafeImage 
                              src={request.program.image} 
                              alt={request.program.name} 
                              width={40} 
                              height={40} 
                              className="object-cover"
                            />
                          ) : (
                            request.program.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{request.program.name}</div>
                          <div className="text-sm text-gray-400">{request.program.domain || request.program.url || 'No URL'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {request.program.categories.length > 0 ? (
                          request.program.categories.map((category, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-200"
                            >
                              {category}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">No categories</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'APPROVED' ? 'bg-green-900 text-green-200' : 
                          request.status === 'PENDING' ? 'bg-yellow-900 text-yellow-200' : 
                          'bg-red-900 text-red-200'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {request.status === 'PENDING' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAction(request.id, 'APPROVED')}
                            disabled={actionStatus[request.id] === 'LOADING'}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-xs"
                          >
                            {actionStatus[request.id] === 'LOADING' ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleAction(request.id, 'REJECTED')}
                            disabled={actionStatus[request.id] === 'LOADING'}
                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-xs"
                          >
                            {actionStatus[request.id] === 'LOADING' ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {request.status === 'APPROVED' ? 'Approved' : 'Rejected'} on {new Date(request.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                      {actionStatus[request.id] === 'SUCCESS' && (
                        <div className="text-green-400 text-xs mt-1">
                          Action completed successfully
                        </div>
                      )}
                      {actionStatus[request.id] === 'ERROR' && (
                        <div className="text-red-400 text-xs mt-1">
                          Error occurred
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
