'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.replace('/auth/login');
      return;
    }

    if (session.user?.role !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }

    setIsAuthorized(true);
  }, [session, status, router]);

  // Show nothing until we verify the session
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
