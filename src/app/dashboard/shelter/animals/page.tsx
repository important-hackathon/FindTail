"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import AnimalListItem from "@/components/animals/AnimalListItem";

export default function ShelterAnimalsPage() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnimals();
    }
  }, [user]);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("animals")
        .select(
          `
          *,
          images:animal_images(*)
        `
        )
        .eq("shelter_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAnimals(data || []);
    } catch (err: any) {
      console.error("Error fetching animals:", err);
      setError("Failed to load animals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnimal = (deletedId: string) => {
    setAnimals(animals.filter((animal) => animal.id !== deletedId));
  };

  return (
    <div className="bg-[#F7EFE3] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Тварини</h1>
          <Link
            href="/dashboard/shelter/animals/add"
            className="px-4 py-2 bg-[#88A7D5] text-white rounded-md transition duration-200 hover:scale-105 hover:bg-[#5c7497]"
          >
            Додати нову тварину
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex-col  flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-blue-200 mb-4"></div>
              <p className="text-gray-600">Завантаження</p>
            </div>
          </div>
        ) : animals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Ще не має тварин
            </h2>
            <p className="text-gray-600 mb-6">
              Додайте інформацію про тварин в вашому притулку.
            </p>
            {/* <Link
              href="/dashboard/shelter/animals/add"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Your First Animal
            </Link> */}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map((animal) => (
              <AnimalListItem
                key={animal.id}
                animal={animal}
                isShelterView={true}
                onDelete={handleDeleteAnimal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
