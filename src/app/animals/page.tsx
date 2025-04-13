// src/app/animals/page.tsx
import { Suspense } from 'react';
import AnimalsPageContent from '@/components/animals/AnimalsPageContent';

export default function AnimalsPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#FDF5EB] py-20 px-4 sm:px-6 lg:px-8 text-center text-[#432907] min-h-screen">
        <div className="flex justify-center items-center h-64">
          <p>Завантаження...</p>
        </div>
      </div>
    }>
      <AnimalsPageContent />
    </Suspense>
  );
}