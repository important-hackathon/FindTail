'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import AnimalListItem from '@/components/animals/AnimalListItem';
import AnimalSearch from '@/components/search/AnimalSearch';

export default function AnimalsPage() {
  const searchParams = useSearchParams();
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const initialFilters = {
    species: searchParams.get('species') || '',
    gender: searchParams.get('gender') || '',
    age_max: searchParams.get('age_max') || '',
    health_status: searchParams.get('health_status') || '',
    location: searchParams.get('location') || '',
    search: searchParams.get('search') || '',
  };
  
  useEffect(() => {
    fetchAnimals(initialFilters);
  }, []);
  
  const fetchAnimals = async (filters: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Start building the query
      let query = supabase
        .from('animals')
        .select(`
          *,
          shelter:profiles!inner(*),
          images:animal_images(*)
        `)
        .eq('is_adopted', false)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.species) {
        query = query.eq('species', filters.species);
      }
      
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      
      if (filters.age_max) {
        query = query.lte('age_years', parseInt(filters.age_max));
      }
      
      if (filters.health_status) {
        query = query.eq('health_status', filters.health_status);
      }
      
      if (filters.location) {
        query = query.ilike('profiles.address', `%${filters.location}%`);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,breed.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setAnimals(data || []);
    } catch (err: any) {
      console.error('Error fetching animals:', err);
      setError('Failed to load animals. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (filters: any) => {
    fetchAnimals(filters);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Find a Pet</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AnimalSearch onSearch={handleSearch} initialFilters={initialFilters} />
        </div>
        
        <div className="lg:col-span-3">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-12">
              <p>Loading animals...</p>
            </div>
          ) : animals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No animals found</h2>
              <p className="text-gray-600">
                Try adjusting your search filters to find more pets.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {animals.map(animal => (
                <AnimalListItem 
                  key={animal.id} 
                  animal={animal} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
