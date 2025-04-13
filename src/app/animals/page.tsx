'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import AnimalListItem from '@/components/animals/AnimalListItem';
import AnimalSearch from '@/components/search/AnimalSearch';
import Image from "next/image";

export default function AnimalsPage() {
  const searchParams = useSearchParams();
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<any>(null);

  // Wait for searchParams to be available before initializing
  useEffect(() => {
    if (!initialized && searchParams) {
      // Build filters from URL parameters
      const initialFilters = {
        species: searchParams.get('species') || '',
        gender: searchParams.get('gender') || '',
        age_max: searchParams.get('age_max') || '',
        health_status: searchParams.get('health_status') || '',
        location: searchParams.get('location') || '',
        search: searchParams.get('search') || '',
      };
      
      setCurrentFilters(initialFilters);
      fetchAnimals(initialFilters);
      setInitialized(true);
    }
  }, [searchParams, initialized]);

  const fetchAnimals = async (filters: any) => {
    try {
      console.log("Fetching animals with filters:", filters);
      setLoading(true);
      setError(null);

      // Start with a basic query
      let query = supabase
        .from('animals')
        .select(`
          *,
          images:animal_images(*)
        `)
        .eq('is_adopted', false)
        .order('created_at', { ascending: false });

      // Apply filters conditionally
      if (filters.species) query = query.eq('species', filters.species);
      if (filters.gender) query = query.eq('gender', filters.gender);
      if (filters.age_max) query = query.lte('age_years', parseInt(filters.age_max));
      if (filters.health_status) query = query.eq('health_status', filters.health_status);
      
      // Get the animal data first
      const { data: animalData, error: animalError } = await query;
      
      if (animalError) {
        throw animalError;
      }
      
      if (!animalData || animalData.length === 0) {
        setAnimals([]);
        setLoading(false);
        return;
      }
      
      // Now fetch shelter info for each animal
      const animalsWithShelterInfo = await Promise.all(
        animalData.map(async (animal) => {
          try {
            // Get shelter profile
            const { data: shelterData } = await supabase
              .from('profiles')
              .select(`
                *,
                shelter_details(*)
              `)
              .eq('id', animal.shelter_id)
              .single();
              
            return {
              ...animal,
              shelter: shelterData || null
            };
          } catch (shelterError) {
            console.error(`Error fetching shelter info for animal ${animal.id}:`, shelterError);
            return {
              ...animal,
              shelter: null
            };
          }
        })
      );
      
      // Apply text search and location filter on the client side if needed
      let filteredAnimals = animalsWithShelterInfo;
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredAnimals = filteredAnimals.filter(animal => 
          (animal.name && animal.name.toLowerCase().includes(searchTerm)) ||
          (animal.breed && animal.breed.toLowerCase().includes(searchTerm)) ||
          (animal.description && animal.description.toLowerCase().includes(searchTerm))
        );
      }
      
      if (filters.location) {
        const locationTerm = filters.location.toLowerCase();
        filteredAnimals = filteredAnimals.filter(animal => 
          animal.shelter && 
          animal.shelter.address && 
          animal.shelter.address.toLowerCase().includes(locationTerm)
        );
      }

      console.log(`Successfully fetched ${filteredAnimals.length} animals`);
      setAnimals(filteredAnimals);
    } catch (err: any) {
      console.error('Error fetching animals:', err);
      setError('Failed to load animals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: any) => {
    setCurrentFilters(filters);
    fetchAnimals(filters);
  };

  return (
    <div className="bg-[#FDF5EB] py-20 px-4 sm:px-6 lg:px-8 text-center text-[#432907] min-h-screen">
      <div className="max-w-5xl mx-auto text-center mb-10 px-4 relative">
        <div className="absolute sm:bottom-17 sm:left-65 bottom-26 left-10">
          <Image
            src="/assets/images/pet-ears.svg"
            alt="ears"
            width={100}
            height={100}
            className='sm:w-auto w-1/2'
          />
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2">
          Знайти тваринку
        </h2>
        <p className="text-sm sm:text-base text-[#432907] max-w-2xl mx-auto">
          Тут ти знайдеш тварин, які шукають дім і турботливого друга. Скористайся фільтрами, щоб швидше знайти саме
          того, кого шукаєш.
        </p>
      </div>

      <AnimalSearch onSearch={handleSearch} initialFilters={currentFilters || {}}/>

      <div className="mt-10">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {loading ? (
          <div className="py-10">Завантаження...</div>
        ) : animals.length === 0 ? (
          <div className="bg-white text-gray-800 rounded-lg p-8 shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-2">Тваринок не знайдено</h2>
            <p>Спробуй змінити фільтри або пошукові параметри</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {animals.map((animal) => (
              <AnimalListItem key={animal.id} animal={animal}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}