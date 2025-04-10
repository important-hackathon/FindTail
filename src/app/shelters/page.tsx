'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import ShelterCard from '@/components/shelters/ShelterCard';

export default function SheltersPage() {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  
  useEffect(() => {
    fetchShelters();
  }, []);
  
  const fetchShelters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all shelters with animal count
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          shelter_details(*),
          animals!inner(count)
        `)
        .eq('user_type', 'shelter')
        .eq('animals.is_adopted', false)
        .order('shelter_details(shelter_name)');
        
      if (error) throw error;
      
      // Process the data to include animal count
      const processedData = data?.map(shelter => ({
        ...shelter,
        animals_count: shelter.animals?.[0]?.count || 0
      })) || [];
      
      setShelters(processedData);
    } catch (err: any) {
      console.error('Error fetching shelters:', err);
      setError('Failed to load shelters. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter shelters based on search query and filter type
  const filteredShelters = shelters.filter(shelter => {
    const nameMatch = shelter.shelter_details.shelter_name.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch = shelter.shelter_details.location.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = !filterType || shelter.shelter_details.shelter_type === filterType;
    
    return (nameMatch || locationMatch) && typeMatch;
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Animal Shelters</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Shelters
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shelter Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="animal_shelter">Animal Shelter</option>
              <option value="vet_clinic">Veterinary Clinic</option>
              <option value="rescue_group">Rescue Group</option>
              <option value="breeder">Breeder</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-12">
          <p>Loading shelters...</p>
        </div>
      ) : filteredShelters.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No shelters found</h2>
          <p className="text-gray-600">
            Try adjusting your search filters or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShelters.map(shelter => (
            <ShelterCard key={shelter.id} shelter={shelter} />
          ))}
        </div>
      )}
    </div>
  );
}
