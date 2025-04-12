"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import ShelterCard from '@/components/shelters/ShelterCard';
import { fixMissingShelterDetails } from '@/lib/helpers';
import SearchShelters from "@/components/shelters/SearchShelters";
import ShelterSelect from "@/components/shelters/ShelterSelect";
import { shelterTypeOptions } from "@/constants/shelterTypeOptions";

export default function SheltersPage() {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  // This useEffect will run once when the component mounts
  useEffect(() => {
    // Only fetch shelters if the component hasn't been initialized yet
    if (!initialized) {
      fetchShelters();
      setInitialized(true);
    }
  }, [initialized]);

  const fetchShelters = async () => {
    try {
      console.log("Fetching shelters...");
      setLoading(true);
      setError(null);

      // First, fix missing shelter details
      try {
        await fixMissingShelterDetails();
      } catch (fixError) {
        console.error("Error fixing shelter details:", fixError);
        // Continue with the fetch even if this fails
      }
      
      // Get all shelter profiles first
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq('user_type', 'shelter')
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        throw profilesError;
      }
      
      if (!profilesData || profilesData.length === 0) {
        setShelters([]);
        setLoading(false);
        return;
      }
      
      // Now, get shelter details for each profile
      const sheltersWithDetails = await Promise.all(
        profilesData.map(async (profile) => {
          try {
            // Get shelter details
            const { data: shelterDetails } = await supabase
              .from("shelter_details")
              .select("*")
              .eq("profile_id", profile.id)
              .single();
              
            // Get animal count
            const { data: animalCount } = await supabase
              .from("animals")
              .select("id", { count: 'exact' })
              .eq("shelter_id", profile.id)
              .eq("is_adopted", false);
              
            return {
              ...profile,
              shelter_details: shelterDetails || {
                shelter_name: profile.full_name,
                shelter_type: "animal_shelter",
                location: profile.address || "Unknown",
                description: "",
                website: ""
              },
              animals_count: animalCount?.length || 0
            };
          } catch (detailsError) {
            console.error(`Error fetching details for shelter ${profile.id}:`, detailsError);
            // Return profile with default/empty shelter details
            return {
              ...profile,
              shelter_details: {
                shelter_name: profile.full_name,
                shelter_type: "animal_shelter",
                location: profile.address || "Unknown",
                description: "",
                website: ""
              },
              animals_count: 0
            };
          }
        })
      );
      
      console.log(`Successfully fetched ${sheltersWithDetails.length} shelters`);
      setShelters(sheltersWithDetails);
    } catch (err: any) {
      console.error("Error fetching shelters:", err);
      setError("Failed to load shelters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter shelters based on search query and filter type
  const filteredShelters = shelters.filter(shelter => {
    // Check for shelter_details before accessing properties
    const shelterName = shelter.shelter_details?.shelter_name || '';
    const shelterLocation = shelter.shelter_details?.location || '';
    const shelterType = shelter.shelter_details?.shelter_type || '';
    
    const nameMatch = shelterName.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch = shelterLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = !filterType || shelterType === filterType;
    
    return (nameMatch || locationMatch) && typeMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        Притулки для тварин
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchShelters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            label="Пошук притулків"
          />

          <div className="sm:w-64">
            <ShelterSelect
              label="Тип притулку"
              shelterType={filterType}
              setShelterType={setFilterType}
              items={shelterTypeOptions}
            />
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
          <p>Завантаження притулків...</p>
        </div>
      ) : filteredShelters.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Жодного притулку не знайдено
          </h2>
          <p className="text-gray-600">
            Спробуйте налаштувати фільтри пошуку або перевірте пізніше.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShelters.map((shelter) => (
            <ShelterCard key={shelter.id} shelter={shelter} />
          ))}
        </div>
      )}
    </div>
  );
}