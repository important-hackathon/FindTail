import { shelterTypeOptions } from "@/constants/shelterTypeOptions";
import { supabase } from "@/lib/supabase/client";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ShelterCardProps {
  shelter: any;
}

export default function ShelterCard({ shelter }: ShelterCardProps) {
  const [shelterImage, setShelterImage] = useState<string | null>(null);

  // Отримання безпечних значень з перевіркою на null/undefined
  const shelterName =
    shelter.shelter_details?.shelter_name || "Невідомий притулок";
  const shelterTypeObj = shelterTypeOptions.find(
    (shelterOption) =>
      shelterOption.value === shelter.shelter_details?.shelter_type
  );
  const shelterType =
    shelterTypeObj?.label ||
    shelter.shelter_details?.shelter_type.replace("_", " ") ||
    "";
  const shelterLocation =
    shelter.shelter_details?.location || "Невідоме розташування";
  const animalsCount = shelter.animals_count || 0;

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const { data: animalsData, error: animalsError } = await supabase
        .from("animals")
        .select(
          `
                *,
                images:animal_images(*)
              `
        )
        .eq("shelter_id", shelter.id)
        .eq("is_adopted", false)
        .order("created_at", { ascending: false });

      if (animalsError) throw animalsError;

      setShelterImage(animalsData[0]?.image_url || "");
    } catch (error) {
      console.error("Error fetching shelters:", error);
    }
  };

  return (
    <div className="rounded-lg shadow-md overflow-hidden flex flex-col p-6">
      <div className=" flex flex-col lg:flex-row gap-8">
        {shelterImage && (
          <div className="w-40 h-40 flex-shrink-0 rounded-md overflow-hidden relative shadow-xl">
            <Image
              fill
              src={shelterImage}
              alt="Хвостате Серце"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex justify-between w-full flex-col sm:flex-row">
          <div className="flex flex-col flex-grow mb-8 sm:mb-0">
            <div>
              <h2 className="font-bold text-lg md:text-xl">{shelterName}</h2>
              <p>{shelterType}</p>
            </div>

            <div className="mt-auto">
              <p>
                <span className="font-semibold">Рейтинг:</span>{" "}
                {shelter.shelter_details.rating}
              </p>
              <p>
                <span className="font-semibold">Приймає тварин:</span> Так
              </p>
              <p>
                <span className="font-semibold">Кількість тварин:</span>{" "}
                {animalsCount}
              </p>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-0 flex-col flex-grow ">
            <div className="flex gap-2 self-start sm:self-end">
              <MapPin color="#88A7D5" size={16} />
              <span className="font-semibold text-sm">{shelterLocation}</span>
            </div>

            <Link
              href={`/shelters/${shelter.id}`}
              className="self-start sm:self-end mt-auto uppercase rounded-full bg-[#88A7D5] py-2 px-8 text-white font-bold cursor-pointer"
            >
              Переглянути
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
