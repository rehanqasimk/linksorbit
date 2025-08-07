'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Publisher {
  id: string;
  name: string;
  email: string;
  website: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  siteId?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  if (!session) {
    return null; // Don't render anything while session is loading
  }

  useEffect(() => {
    if (!session) {
      return; // Wait for session to load
    }

    if (session.user?.role !== 'ADMIN') {
      router.replace('/auth/login');
      return;
    }

    fetchPublishers();
  }, [session, router]);

  async function fetchPublishers() {
    try {
      const response = await fetch('/api/admin/publishers');
      const data = await response.json();
      setPublishers(data.publishers);
    } catch (error) {
      console.error('Error fetching publishers:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusUpdate(publisherId: string, newStatus: 'ACTIVE' | 'SUSPENDED') {
    try {
      const response = await fetch(`/api/admin/publishers/${publisherId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh the publishers list
      fetchPublishers();
    } catch (error) {
      console.error('Error updating publisher status:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const filteredPublishers = (publishers || [])
    .filter(pub => filter === 'ALL' || pub.status === filter)
    .filter(pub => 
      searchTerm === '' ||
      pub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  async function handleSiteIdUpdate(publisherId: string, siteId: string) {
    try {
      const response = await fetch(`/api/admin/publishers/${publisherId}/site-id`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId }),
      });

      if (!response.ok) throw new Error('Failed to update Site ID');
      fetchPublishers();
    } catch (error) {
      console.error('Error updating site ID:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Logout
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded ${filter === 'ALL' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 rounded ${filter === 'PENDING' ? 'bg-yellow-600' : 'bg-gray-700'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-3 py-1 rounded ${filter === 'ACTIVE' ? 'bg-green-600' : 'bg-gray-700'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('SUSPENDED')}
              className={`px-3 py-1 rounded ${filter === 'SUSPENDED' ? 'bg-red-600' : 'bg-gray-700'}`}
            >
              Suspended
            </button>
          </div>
          <input
            type="search"
            placeholder="Search publishers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Publishers List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Publisher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Site ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : filteredPublishers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">No publishers found</td>
                  </tr>
                ) : (
                  filteredPublishers.map((publisher) => (
                    <tr key={publisher.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{publisher.name}</div>
                          <div className="text-sm text-gray-400">{publisher.email}</div>
                          <div className="text-xs text-gray-500">
                            Registered: {new Date(publisher.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a href={publisher.website} target="_blank" rel="noopener noreferrer" 
                           className="text-indigo-400 hover:text-indigo-300">
                          {publisher.website}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        {publisher.status === 'ACTIVE' ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={publisher.siteId || ''}
                              placeholder="Enter Site ID"
                              onChange={(e) => handleSiteIdUpdate(publisher.id, e.target.value)}
                              className="px-2 py-1 bg-gray-700 rounded text-sm text-white"
                            />
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${publisher.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                            publisher.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {publisher.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {publisher.status === 'PENDING' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(publisher.id, 'ACTIVE')}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(publisher.id, 'SUSPENDED')}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {publisher.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusUpdate(publisher.id, 'SUSPENDED')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          >
                            Suspend
                          </button>
                        )}
                        {publisher.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleStatusUpdate(publisher.id, 'ACTIVE')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
