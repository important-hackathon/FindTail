"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

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

  // Format age display
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

    return `${age_years} ${getYearLabel(
      age_years
    )}, ${age_months} ${getMonthLabel(age_months)}`;
  };

  // Get health status class
  const getHealthStatusClass = () => {
    switch (animal.health_status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "needs_care":
        return "bg-yellow-100 text-yellow-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format health status text
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
    if (
      window.confirm(
        "Are you sure you want to delete this animal? This action cannot be undone."
      )
    ) {
      try {
        setIsDeleting(true);

        // Delete the animal record (cascade should handle related records)
        const { error } = await supabase
          .from("animals")
          .delete()
          .eq("id", animal.id);

        if (error) throw error;

        if (onDelete) {
          onDelete(animal.id);
        }

        router.refresh();
      } catch (error) {
        console.error("Error deleting animal:", error);
        alert("Failed to delete the animal. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-[#F7EFE3] rounded-lg shadow-md overflow-hidden transition duration-200 hover:scale-105">
      <div className="relative h-48">
        {animal.images && animal.images[0] ? (
          <img
            src={animal.images[0].image_url}
            alt={animal.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Немає зображення</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">{animal.name}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${getHealthStatusClass()}`}
          >
            {formatHealthStatus()}
          </span>
        </div>

        <div className="mt-2 text-sm text-gray-600">
          <p>
            {animal.species === "dog"
              ? "🐕"
              : animal.species === "cat"
              ? "🐈"
              : "🐾"}{" "}
            {animal.breed || animal.species}
          </p>
          <p>Вік: {formatAge()}</p>
          <p>
            Стать:{" "}
            {animal.gender === "male"
              ? "Самець"
              : animal.gender === "female"
              ? "Самка"
              : "Невідомо"}
          </p>
        </div>

        <div className="mt-4 text-sm text-gray-600 line-clamp-2">
          {animal.description || "Не надано опису."}
        </div>

        <div className="mt-4 flex flex-col gap-10">
          <Link
            href={`/animals/${animal.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Переглянути
          </Link>

          {isShelterView && (
            <div className="flex space-x-2">
              <Link
                href={`/dashboard/shelter/animals/edit/${animal.id}`}
                className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Редагувати
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 cursor-pointer"
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
