'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Publisher {
  id: string;
  name: string;
  email: string;
  website: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (session?.user?.role !== 'ADMIN') {
      router.push('/auth/login');
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Publisher Requests</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {publishers.map((publisher) => (
              <li key={publisher.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{publisher.name}</h3>
                      <p className="text-sm text-gray-500">{publisher.email}</p>
                      <p className="text-sm text-gray-500">Website: {publisher.website}</p>
                      <p className="text-sm text-gray-500">
                        Registered: {new Date(publisher.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      {publisher.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(publisher.id, 'ACTIVE')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(publisher.id, 'SUSPENDED')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${publisher.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          publisher.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {publisher.status}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {publishers.length === 0 && (
              <li>
                <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
                  No pending publisher requests
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
