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

  // Update filters if searchParams or initialFilters change
  useEffect(() => {
    if (searchParams) {
      setFilters({
        species: initialFilters.species || searchParams.get('species') || '',
        gender: initialFilters.gender || searchParams.get('gender') || '',
        age_max: initialFilters.age_max || searchParams.get('age_max') || '',
        health_status: initialFilters.health_status || searchParams.get('health_status') || '',
        location: initialFilters.location || searchParams.get('location') || '',
        search: initialFilters.search || searchParams.get('search') || '',
      });
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

  return (
      <section className="bg-[#FDF5EB] py-10 text-[#432907]">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-3 w-full">
            <Dropdown
                name="species"
                value={filters.species}
                onChange={(value) => handleDropdownChange('species', value)}
                options={speciesOptions}
                placeholder="Ким"
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
            <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#88A7DC] text-white font-bold text-sm hover:bg-[#6c8bc6] transition"
            >
              ЗНАЙТИ
            </button>
          </div>
        </form>
      </section>
  );
}