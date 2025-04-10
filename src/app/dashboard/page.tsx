'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, profile, loading, isVolunteer, isShelter } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (!loading && user && profile) {
      if (isVolunteer) {
        router.push('/dashboard/volunteer');
      } else if (isShelter) {
        router.push('/dashboard/shelter');
      }
    }
  }, [loading, user, profile, isVolunteer, isShelter, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
}
