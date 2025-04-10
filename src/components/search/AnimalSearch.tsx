'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AnimalSearchProps {
  onSearch: (filters: any) => void;
  initialFilters?: any;
}

export default function AnimalSearch({ onSearch, initialFilters = {} }: AnimalSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    species: initialFilters.species || searchParams.get('species') || '',
    gender: initialFilters.gender || searchParams.get('gender') || '',
    age_max: initialFilters.age_max || searchParams.get('age_max') || '',
    health_status: initialFilters.health_status || searchParams.get('health_status') || '',
    location: initialFilters.location || searchParams.get('location') || '',
    search: initialFilters.search || searchParams.get('search') || '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove empty filters
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    
    // Call the onSearch callback
    onSearch(activeFilters);
    
    // Update URL with search params
    const params = new URLSearchParams();
    Object.entries(activeFilters).forEach(([key, value]) => {
      params.set(key, value.toString());
    });
    
    const newUrl = `/animals${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };
  
  const clearFilters = () => {
    setFilters({
      species: '',
      gender: '',
      age_max: '',
      health_status: '',
      location: '',
      search: '',
    });
    
    onSearch({});
    router.push('/animals');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Search Animals</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              name="search"
              placeholder="Name, breed, etc."
              value={filters.search}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Species
              </label>
              <select
                name="species"
                value={filters.species}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="dog">Dogs</option>
                <option value="cat">Cats</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={filters.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Age (Years)
              </label>
              <select
                name="age_max"
                value={filters.age_max}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Age</option>
                <option value="1">Up to 1 year</option>
                <option value="3">Up to 3 years</option>
                <option value="5">Up to 5 years</option>
                <option value="10">Up to 10 years</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Status
              </label>
              <select
                name="health_status"
                value={filters.health_status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Status</option>
                <option value="healthy">Healthy</option>
                <option value="needs_care">Needs Care</option>
                <option value="urgent">Urgent Care Needed</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              placeholder="City, region, etc."
              value={filters.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
