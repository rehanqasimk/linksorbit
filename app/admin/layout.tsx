'use client';

import { SessionProvider } from 'next-auth/react';
import AdminGuard from '@/components/AdminGuard';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  
  const currentPage = pathname === '/admin' 
    ? 'dashboard' 
    : pathname.includes('/program-requests') 
      ? 'program-requests' 
      : '';
  
  return (
    <SessionProvider>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 text-white p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold">
                  {currentPage === 'dashboard' && 'Admin Dashboard'}
                  {currentPage === 'program-requests' && 'Program Join Requests'}
                </h1>
                <nav className="flex space-x-6 mt-2">
                  <Link 
                    href="/admin" 
                    className={`text-white ${currentPage === 'dashboard' ? 'text-indigo-400' : 'hover:text-gray-300'}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/admin/program-requests" 
                    className={`text-white ${currentPage === 'program-requests' ? 'text-indigo-400' : 'hover:text-gray-300'}`}
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
            
            {/* Pass notification handling down to children via context or props */}
            {children}
          </div>
        </div>
      </AdminGuard>
    </SessionProvider>
  );
}
