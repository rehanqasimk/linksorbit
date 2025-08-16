'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';

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
  const [actionStatus, setActionStatus] = useState<{[key: string]: string}>({});
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchProgramRequests();
  }, [filter]);

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
    if (filter === 'ALL') return true;
    return request.status === filter;
  });

  if (!session || session.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You do not have permission to access this page.</p>
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Program Join Requests"
      currentPage="program-requests"
      notification={notification}
      onDismissNotification={() => setNotification(null)}
    >
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
              No {filter === 'ALL' ? '' : filter.toLowerCase()} program requests found.
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
                              <Image 
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
    </AdminLayout>
  );
}
