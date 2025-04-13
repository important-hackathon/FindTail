"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { FaMapMarkerAlt } from "react-icons/fa";

interface AnimalListItemProps {
  animal: any;
  isShelterView?: boolean;
  onDelete?: (id: string) => void;
}

export default function AnimalListItem({
                                         animal,
                                         isShelterView = false,
                                         onDelete,
                                       }: AnimalListItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatAge = () => {
    const { age_years, age_months } = animal;

    const getYearLabel = (num: number) => {
      if (num === 1) return "рік";
      if (num >= 2 && num <= 4) return "роки";
      return "років";
    };

    const getMonthLabel = (num: number) => {
      if (num === 1) return "місяць";
      if (num >= 2 && num <= 4) return "місяці";
      return "місяців";
    };

    if (age_years === 0 && age_months === 0) return "вік невідомий";
    if (age_years === 0) return `${age_months} ${getMonthLabel(age_months)}`;
    if (age_months === 0) return `${age_years} ${getYearLabel(age_years)}`;

    return `${age_years} ${getYearLabel(age_years)}, ${age_months} ${getMonthLabel(age_months)}`;
  };

  const formatHealthStatus = () => {
    switch (animal.health_status) {
      case "healthy":
        return "Здоровий";
      case "needs_care":
        return "Потребує догляду";
      case "urgent":
        return "Потрібна Термінова Допомога";
      default:
        return "Невідомо";
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Ви впевнені, що хочете видалити тваринку?")) {
      try {
        setIsDeleting(true);
        const { error } = await supabase
            .from("animals")
            .delete()
            .eq("id", animal.id);

        if (error) throw error;

        if (onDelete) onDelete(animal.id);
        router.refresh();
      } catch (error) {
        console.error("Error deleting animal:", error);
        alert("Помилка при видаленні.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const imageUrl = animal.images?.[0]?.image_url || "/assets/images/default-animal.jpg";
  const location = animal.shelter?.address || "Невідома локація";

  return (
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-[#F7EFE3] rounded-lg px-6 py-4 shadow-sm border border-[#DDD]">
        <div className="flex-shrink-0 w-[110px] h-[110px] rounded-md overflow-hidden">
          <img
              src={imageUrl}
              alt={animal.name}
              className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-[#432907] mb-1">
            {animal.name}
          </h3>
          <p className="text-sm text-[#432907] mb-1 font-medium">
            {animal.breed || animal.species}
          </p>
          <p className="text-sm text-[#432907] line-clamp-2">
            {animal.description || "Опис відсутній."}
          </p>
        </div>

        <div className="flex flex-col items-end justify-between gap-2">
          <div className="text-sm text-[#432907] text-right">
            <p>• {formatAge()}</p>
            <p>• {formatHealthStatus()}</p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <FaMapMarkerAlt className="text-[#432907]" />
              <span>{location}</span>
            </div>
          </div>

          <div className="mt-2">
            {!isShelterView ? (
                <Link
                    href={`/animals/${animal.id}`}
                    className="text-sm px-4 py-1 rounded-full bg-[#B4B9EF] text-white font-semibold shadow hover:brightness-105 transition"
                >
                  ХОЧУ ЗАБРАТИ!
                </Link>
            ) : (
                <div className="flex gap-2 mt-1">
                  <Link
                      href={`/dashboard/shelter/animals/edit/${animal.id}`}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    Редагувати
                  </Link>
                  <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                  >
                    {isDeleting ? "Видалення..." : "Видалити"}
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}