"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import ShelterCard from "@/components/shelters/ShelterCard";
import SearchShelters from "@/components/shelters/SearchShelters";
import ShelterSelect from "@/components/shelters/ShelterSelect";
import { shelterTypeOptions } from "@/constants/shelterTypeOptions";

export default function SheltersPage() {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [shelterType, setShelterType] = useState<string>("");

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all shelters with animal count
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          shelter_details(*),
          animals!inner(count)
        `
        )
        .eq("user_type", "shelter")
        .eq("animals.is_adopted", false)
        .order("shelter_details(shelter_name)");

      if (error) throw error;

      // Process the data to include animal count
      const processedData =
        data?.map((shelter) => ({
          ...shelter,
          animals_count: shelter.animals?.[0]?.count || 0,
        })) || [];

      setShelters(processedData);
    } catch (err: any) {
      console.error("Error fetching shelters:", err);
      setError("Failed to load shelters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter shelters based on search query and filter type
  const filteredShelters = shelters.filter((shelter) => {
    const nameMatch = shelter.shelter_details?.shelter_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const locationMatch =
      shelter &&
      shelter.shelter_details?.location
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const typeMatch =
      !shelterType || shelter.shelter_details?.shelter_type === shelterType;

    return (nameMatch || locationMatch) && typeMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 ">
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
              shelterType={shelterType}
              setShelterType={setShelterType}
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
          <p>Завантаження притулків</p>
        </div>
      ) : filteredShelters.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Жодного притулку не знайдно.
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
