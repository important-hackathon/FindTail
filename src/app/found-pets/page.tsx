
// src/app/found-pets/page.tsx
// This page will redirect to login if not authorized, or it could be removed 
// if only shelters should access found pet reports

// Recommended: Let's redirect to login page if a regular user tries to access this
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function FoundPetsRedirectPage() {
  const { user, loading, isShelter } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (isShelter) {
        router.push('/dashboard/shelter/found-pets');
      } else {
        // For volunteers, redirect to the report form
        router.push('/dashboard/volunteer/found');
      }
    }
  }, [loading, user, isShelter, router]);
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <p>Перенаправлення...</p>
    </div>
  );
}