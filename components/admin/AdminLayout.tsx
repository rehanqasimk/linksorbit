'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  currentPage: 'dashboard' | 'publishers' | 'program-requests';
  notification?: {
    message: string;
    type: 'success' | 'error';
  } | null;
  onDismissNotification?: () => void;
}

export default function AdminLayout({ 
  children, 
  title,
  currentPage,
  notification,
  onDismissNotification
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <nav className="flex space-x-6 mt-2">
              <Link 
                href="/admin" 
                className={`text-white hover:text-gray-300 ${currentPage === 'dashboard' ? 'font-bold' : ''}`}
              >
                Dashboard
              </Link>
              {/* <Link 
                href="/admin/publishers" 
                className={`text-white hover:text-gray-300 ${currentPage === 'publishers' ? 'font-bold' : ''}`}
              >
                Publishers
              </Link> */}
              <Link 
                href="/admin/program-requests" 
                className={`text-white hover:text-gray-300 ${currentPage === 'program-requests' ? 'font-bold' : ''}`}
              >
                Program Requests
              </Link>
            </nav>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Logout
          </button>
        </div>
        
        {/* Notification */}
        {notification && (
          <div className={`p-4 rounded-md ${
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
              onClick={onDismissNotification}
              className="text-white ml-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Main Content */}
        {children}
      </div>
    </div>
  );
}
