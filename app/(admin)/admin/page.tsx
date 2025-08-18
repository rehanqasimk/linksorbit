'use client';

import { useSession } from 'next-auth/react';
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

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmVariant: 'green' | 'red';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white ${
              confirmVariant === 'green' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [updatingSiteIds, setUpdatingSiteIds] = useState<{[key: string]: boolean}>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    confirmVariant: 'green' | 'red';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: 'Cancel',
    confirmVariant: 'green',
    onConfirm: () => {},
  });

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

  function showConfirmationDialog(publisherId: string, newStatus: 'ACTIVE' | 'SUSPENDED', publisher: Publisher) {
    const isApproving = newStatus === 'ACTIVE';
    const isDeclining = newStatus === 'SUSPENDED' && publisher.status === 'PENDING';
    const isSuspending = newStatus === 'SUSPENDED' && publisher.status === 'ACTIVE';
    
    let title = '';
    let message = '';
    let confirmText = '';
    let confirmVariant: 'green' | 'red' = 'green';
    
    if (isApproving && publisher.status === 'PENDING') {
      title = 'Approve Publisher Account';
      message = `Are you sure you want to approve ${publisher.name}'s account? They will receive an email notification and gain access to the platform.`;
      confirmText = 'Approve';
      confirmVariant = 'green';
    } else if (isApproving && publisher.status === 'SUSPENDED') {
      title = 'Reactivate Publisher Account';
      message = `Are you sure you want to reactivate ${publisher.name}'s account? They will regain access to the platform.`;
      confirmText = 'Reactivate';
      confirmVariant = 'green';
    } else if (isDeclining) {
      title = 'Decline Publisher Account';
      message = `Are you sure you want to decline ${publisher.name}'s account application? They will receive an email notification.`;
      confirmText = 'Decline';
      confirmVariant = 'red';
    } else if (isSuspending) {
      title = 'Suspend Publisher Account';
      message = `Are you sure you want to suspend ${publisher.name}'s account? They will lose access to the platform.`;
      confirmText = 'Suspend';
      confirmVariant = 'red';
    }
    
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      confirmVariant,
      onConfirm: () => performStatusUpdate(publisherId, newStatus, publisher),
    });
  }

  async function performStatusUpdate(publisherId: string, newStatus: 'ACTIVE' | 'SUSPENDED', publisher: Publisher) {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/publishers/${publisherId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Show success notification
      const isApproval = newStatus === 'ACTIVE' && publisher.status === 'PENDING';
      const isReactivation = newStatus === 'ACTIVE' && publisher.status === 'SUSPENDED';
      const isDecline = newStatus === 'SUSPENDED' && publisher.status === 'PENDING';
      const isSuspend = newStatus === 'SUSPENDED' && publisher.status === 'ACTIVE';
      
      let message = '';
      
      if (isApproval) message = `${publisher.name}'s account has been approved`;
      else if (isReactivation) message = `${publisher.name}'s account has been reactivated`;
      else if (isDecline) message = `${publisher.name}'s account has been declined`;
      else if (isSuspend) message = `${publisher.name}'s account has been suspended`;
      
      setNotification({
        message,
        type: 'success'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);

      // Refresh the publishers list
      fetchPublishers();
    } catch (error) {
      console.error('Error updating publisher status:', error);
      setNotification({
        message: 'Failed to update account status',
        type: 'error'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  }

  // Handler to initiate the confirmation dialog
  function handleStatusUpdate(publisherId: string, newStatus: 'ACTIVE' | 'SUSPENDED') {
    const publisher = publishers.find(pub => pub.id === publisherId);
    if (!publisher) return;
    
    showConfirmationDialog(publisherId, newStatus, publisher);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold mb-8">Admin Dashboard</h1>
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-300">Loading publisher data...</p>
          </div>
        </div>
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
      // Mark this specific publisher's Site ID as updating
      setUpdatingSiteIds(prev => ({ ...prev, [publisherId]: true }));
      
      const response = await fetch(`/api/admin/publishers/${publisherId}/site-id`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId }),
      });

      if (!response.ok) throw new Error('Failed to update Site ID');
      
      // Show success notification
      const publisher = publishers.find(pub => pub.id === publisherId);
      setNotification({
        message: `Site ID for ${publisher?.name || 'publisher'} has been updated successfully`,
        type: 'success'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      await fetchPublishers();
    } catch (error) {
      console.error('Error updating site ID:', error);
      setNotification({
        message: 'Failed to update Site ID',
        type: 'error'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      // Remove the updating state for this publisher
      setUpdatingSiteIds(prev => ({ ...prev, [publisherId]: false }));
    }
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
                        <div className="flex items-center space-x-2 relative">
                          <div className="relative flex-grow">
                            <input
                              type="text"
                              value={publisher.siteId || ''}
                              placeholder="Enter Site ID"
                              onChange={(e) => {
                                const updatedPublishers = publishers.map(p => 
                                  p.id === publisher.id ? {...p, siteId: e.target.value} : p
                                );
                                setPublishers(updatedPublishers);
                              }}
                              className={`w-full px-2 py-1 bg-gray-700 rounded text-sm text-white border ${
                                publisher.siteId !== undefined && publisher.siteId !== '' 
                                  ? 'border-gray-600' 
                                  : 'border-red-500'
                              }`}
                              aria-label="Site ID"
                              title={publisher.siteId ? "Current Site ID" : "No Site ID assigned"}
                            />
                            {publisher.siteId === '' && (
                              <span className="text-xs text-red-400 absolute left-0 -bottom-5">
                                Required field
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (!publisher.siteId) {
                                setNotification({
                                  message: 'Please enter a Site ID before saving',
                                  type: 'error'
                                });
                                setTimeout(() => setNotification(null), 5000);
                                return;
                              }
                              handleSiteIdUpdate(publisher.id, publisher.siteId);
                            }}
                            disabled={!publisher.siteId || updatingSiteIds[publisher.id]}
                            className={`px-3 py-1 rounded text-sm text-white flex items-center ${
                              !publisher.siteId
                                ? 'bg-gray-500 cursor-not-allowed'
                                : updatingSiteIds[publisher.id]
                                ? 'bg-indigo-500 opacity-75'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                            title="Save Site ID"
                          >
                            {updatingSiteIds[publisher.id] ? (
                              <>
                                <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Save
                              </>
                            )}
                          </button>
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
                            className="flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm transition-colors duration-200 shadow-sm"
                            title="Approve this publisher account"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(publisher.id, 'SUSPENDED')}
                            className="flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors duration-200 shadow-sm"
                            title="Decline this publisher application"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Decline
                          </button>
                        </div>
                      )}
                      {publisher.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleStatusUpdate(publisher.id, 'SUSPENDED')}
                          className="flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors duration-200 shadow-sm"
                          title="Suspend this publisher account"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M13 10V3L4 14h7v7l9-11h-7z" clipRule="evenodd" />
                          </svg>
                          Suspend
                        </button>
                      )}
                      {publisher.status === 'SUSPENDED' && (
                        <button
                          onClick={() => handleStatusUpdate(publisher.id, 'ACTIVE')}
                          className="flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm transition-colors duration-200 shadow-sm"
                          title="Reactivate this publisher account"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
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
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
