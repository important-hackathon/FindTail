'use client';

import Image from 'next/image';
import Dropdown from '@/components/ui/Dropdown';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Find() {
    const router = useRouter();
    const [filters, setFilters] = useState({
        species: '',
        age: '',
        health: '',
        location: '',
        search: '',
    });

    const handleChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters((prev) => ({ ...prev, search: e.target.value }));
    };

    const handleSearch = () => {
        // Convert filters to URL parameters
        const params = new URLSearchParams();
        
        // Map the filter keys to match the expected keys in the animals search page
        if (filters.species) params.set('species', filters.species);
        if (filters.age) params.set('age_max', filters.age);
        if (filters.health) params.set('health_status', filters.health);
        if (filters.location) params.set('location', filters.location);
        if (filters.search) params.set('search', filters.search);
        
        // Only add params if at least one filter is selected
        const hasFilters = Object.values(filters).some(value => value !== '');
        
        // Navigate to animals page with filters
        router.push(`/animals${hasFilters && params.toString() ? `?${params.toString()}` : ''}`);
    };

    const speciesOptions = [
        { label: 'Кіт', value: 'cat' },
        { label: 'Собака', value: 'dog' },
        { label: 'Інше', value: 'other' },
    ];

    const ageOptions = [
        { label: 'До 1 року', value: '1' },
        { label: '1-3 роки', value: '3' },
        { label: '3+ років', value: '10' },
    ];

    const healthOptions = [
        { label: 'Здоровий', value: 'healthy' },
        { label: 'Потребує лікування', value: 'needs_care' },
        { label: 'Терміново', value: 'urgent' },
    ];

    const locationOptions = [
        { label: 'Львів', value: 'Львів' },
        { label: 'Київ', value: 'Київ' },
        { label: 'Харків', value: 'Харків' },
        { label: 'Одеса', value: 'Одеса' },
    ];

    return (
        <section className="relative bg-[#E4EAF1] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-24 relative flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/2 relative">
                    <div className="absolute top-0 left-0 w-full h-full z-0">
                        <Image
                            src="/assets/images/find-pet-shape.svg"
                            alt="shape"
                            width={700}
                            height={700}
                            className="w-full h-auto"
                        />
                    </div>
                    <Image
                        src="/assets/images/find-pet-catdog.svg"
                        alt="dog and cat"
                        width={700}
                        height={700}
                        className="relative z-20"
                    />
                </div>

                <div className="lg:w-1/2 text-center lg:text-left text-[#432907] z-20">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
                        Знайди собі друга!
                    </h2>
                    <p className="text-base sm:text-lg mb-6">
                        Після початку повномасштабної війни тисячі тварин залишились без домівок. Ми створили платформу, щоб дати кожній тварині шанс на нове життя.
                        Приєднуйся до спільноти небайдужих — допомагай, підтримуй, поширюй!
                    </p>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                            <Dropdown
                                name="species"
                                value={filters.species}
                                onChange={(val) => handleChange('species', val)}
                                options={speciesOptions}
                                placeholder="Вид тварини"
                                bgColor="#FDF5EB"
                                textColor="#432907"
                                hoverColor="#E6DBCB"
                            />
                            <Dropdown
                                name="age"
                                value={filters.age}
                                onChange={(val) => handleChange('age', val)}
                                options={ageOptions}
                                placeholder="Вік"
                                bgColor="#FDF5EB"
                                textColor="#432907"
                                hoverColor="#E6DBCB"
                            />
                            <Dropdown
                                name="health"
                                value={filters.health}
                                onChange={(val) => handleChange('health', val)}
                                options={healthOptions}
                                placeholder="Стан здоров'я"
                                bgColor="#FDF5EB"
                                textColor="#432907"
                                hoverColor="#E6DBCB"
                            />
                            <Dropdown
                                name="location"
                                value={filters.location}
                                onChange={(val) => handleChange('location', val)}
                                options={locationOptions}
                                placeholder="Локація"
                                bgColor="#FDF5EB"
                                textColor="#432907"
                                hoverColor="#E6DBCB"
                            />
                        </div>

                        <p className="text-sm text-[#432907]/80 text-end">Або скористайтеся пошуком :)</p>

                        <div className="flex flex-col sm:flex-row gap-2 w-3/4 sm:w-full mx-auto lg:mx-0">
                            <input
                                type="text"
                                placeholder="Введіть тут ..."
                                value={filters.search}
                                onChange={handleInputChange}
                                className="flex-1 px-4 py-2 rounded-full bg-[#FDF5EB] placeholder-[#A1A1A1] focus:outline-none"
                            />
                            <button 
                                onClick={handleSearch}
                                className="px-8 py-2 rounded-full bg-[#A9BFF2] text-white font-semibold hover:bg-[#93a9d5] transition"
                            >
                                знайти
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}