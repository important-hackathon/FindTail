'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnimalForm from '@/components/animals/AnimalForm';
import { supabase } from '@/lib/supabase/client';

export default function EditAnimalPage() {
  const { user, isShelter, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const animalId = params.id as string;
  
  const [animal, setAnimal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!authLoading && (!user || !isShelter)) {
      router.push('/auth/login');
    }
  }, [authLoading, user, isShelter, router]);
  
  useEffect(() => {
    if (user && animalId) {
      fetchAnimal();
    }
  }, [user, animalId]);
  
  const fetchAnimal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('animals')
        .select(`
          *,
          images:animal_images(*)
        `)
        .eq('id', animalId)
        .eq('shelter_id', user?.id) // Ensure this animal belongs to the shelter
        .single();
        
      if (error) throw error;
      
      if (!data) {
        throw new Error('Animal not found or you do not have permission to edit it');
      }
      
      setAnimal(data);
    } catch (err: any) {
      console.error('Error fetching animal:', err);
      setError(err.message || 'Failed to load animal details');
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Animal</h1>
      {animal && <AnimalForm editMode={true} animalData={animal} />}
    </div>
  );
}