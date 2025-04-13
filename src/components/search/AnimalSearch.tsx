'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Dropdown from '@/components/ui/Dropdown';

interface AnimalSearchProps {
  onSearch: (filters: any) => void;
  initialFilters?: any;
}

const speciesOptions = [
  { label: 'Кіт', value: 'cat' },
  { label: 'Собака', value: 'dog' },
  { label: 'Інше', value: 'other' },
];

const genderOptions = [
  { label: 'Хлопчик', value: 'male' },
  { label: 'Дівчинка', value: 'female' },
];

const ageOptions = [
  { label: 'До 1 року', value: '1' },
  { label: 'До 3 років', value: '3' },
  { label: 'До 5 років', value: '5' },
  { label: 'До 10 років', value: '10' },
];

const healthOptions = [
  { label: 'Здорова', value: 'healthy' },
  { label: 'Потребує догляду', value: 'needs_care' },
  { label: 'Терміново', value: 'urgent' },
];

export default function AnimalSearch({ onSearch, initialFilters = {} }: AnimalSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    species: initialFilters.species || '',
    gender: initialFilters.gender || '',
    age_max: initialFilters.age_max || '',
    health_status: initialFilters.health_status || '',
    location: initialFilters.location || '',
    search: initialFilters.search || '',
  });

  // Update filters from URL parameters when component mounts or searchParams change
  useEffect(() => {
    if (searchParams) {
      // Create a new filters object, prioritizing URL params
      const newFilters = {
        species: searchParams.get('species') || initialFilters.species || '',
        gender: searchParams.get('gender') || initialFilters.gender || '',
        age_max: searchParams.get('age_max') || initialFilters.age_max || '',
        health_status: searchParams.get('health_status') || initialFilters.health_status || '',
        location: searchParams.get('location') || initialFilters.location || '',
        search: searchParams.get('search') || initialFilters.search || '',
      };
      
      setFilters(newFilters);
      
      // Note: We removed the onSearch call here to prevent infinite loops
    }
  }, [searchParams, initialFilters]);

  const handleDropdownChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
    );

    onSearch(activeFilters);

    const params = new URLSearchParams();
    Object.entries(activeFilters).forEach(([key, value]) => {
      params.set(key, value.toString());
    });

    router.push(`/animals${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const clearFilters = () => {
    const emptyFilters = {
      species: '',
      gender: '',
      age_max: '',
      health_status: '',
      location: '',
      search: '',
    };
    setFilters(emptyFilters);
    onSearch({});
    router.push('/animals');
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
      <section className="bg-[#FDF5EB] py-10 text-[#432907]">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-3 w-full">
            <Dropdown
                name="species"
                value={filters.species}
                onChange={(value) => handleDropdownChange('species', value)}
                options={speciesOptions}
                placeholder="Вид тваринки"
            />
            <Dropdown
                name="gender"
                value={filters.gender}
                onChange={(value) => handleDropdownChange('gender', value)}
                options={genderOptions}
                placeholder="Стать"
            />
            <Dropdown
                name="age_max"
                value={filters.age_max}
                onChange={(value) => handleDropdownChange('age_max', value)}
                options={ageOptions}
                placeholder="Вік"
            />
            <Dropdown
                name="health_status"
                value={filters.health_status}
                onChange={(value) => handleDropdownChange('health_status', value)}
                options={healthOptions}
                placeholder="Стан здоров'я"
            />
            <input
                type="text"
                name="location"
                placeholder="Локація"
                value={filters.location}
                onChange={handleInputChange}
                className="px-4 py-2 rounded-full bg-[#DDE3EF] font-bold text-sm text-[#432907] placeholder:text-[#888] shadow-sm focus:outline-none"
            />
          </div>

          <div className="py-6 text-sm text-[#432907]">
            Або скористайтеся пошуком :)
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-center items-center">
            <input
                type="text"
                name="search"
                placeholder="Введіть тут …"
                value={filters.search}
                onChange={handleInputChange}
                className="w-3/4 sm:w-[600px] px-4 py-2 rounded-full bg-[#DDE3EF] text-[#432907] font-medium placeholder:text-[#aaa] focus:outline-none"
            />
            <div className="flex gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-2 rounded-full bg-[#F7EFE3] text-[#432907] font-bold text-sm hover:bg-[#E6DBCB] transition"
                >
                  ОЧИСТИТИ
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#88A7DC] text-white font-bold text-sm hover:bg-[#6c8bc6] transition"
              >
                ЗНАЙТИ
              </button>
            </div>
          </div>
        </form>
      </section>
  );
}