'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PublisherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession({ required: true });
  const pathname = usePathname();
  
  // Define the active path for navigation highlighting
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                LinkOrbits
              </h1>
            </div>
            <nav className="flex space-x-6">
              {/* <Link 
                href="/dashboard" 
                className={`${isActive('/dashboard') 
                  ? 'text-indigo-600 font-medium' 
                  : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Dashboard
              </Link> */}
              <Link 
                href="/programs" 
                className={`${isActive('/programs') 
                  ? 'text-indigo-600 font-medium' 
                  : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Programs
              </Link>
              {/* <Link 
                href="/reports" 
                className={`${isActive('/reports') 
                  ? 'text-indigo-600 font-medium' 
                  : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Reports
              </Link>
              <Link 
                href="/incentives" 
                className={`${isActive('/incentives') 
                  ? 'text-indigo-600 font-medium' 
                  : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Incentives
              </Link> */}
              <button 
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isActive('/dashboard') && 'Dashboard'}
            {isActive('/programs') && 'Programs'}
            {isActive('/reports') && 'Reports'}
            {isActive('/incentives') && 'Incentives'}
          </h2>
        </div>
        
        {children}
      </main>
    </div>
  );
}
