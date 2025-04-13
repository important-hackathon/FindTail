'use client';

import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect after loading is complete and we know there's no user
    if (!loading && !user) {
      console.log('Unauthorized access, redirecting to login');
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Завантаження ...</p>
      </div>
    );
  }
  
  // Don't render any dashboard content until we're sure the user is authenticated
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Перенаправлення на вхід ...</p>
      </div>
    );
  }
  
  // Only render the dashboard content if the user is authenticated
  return (
    <>
      <Header />
      {/* <DashboardNav /> */}
      <main>{children}</main>
    </>
  );
}