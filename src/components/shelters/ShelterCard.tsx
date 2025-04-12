import { shelterTypeOptions } from "@/constants/shelterTypeOptions";
import Link from "next/link";

interface ShelterCardProps {
  shelter: any;
}

export default function ShelterCard({ shelter }: ShelterCardProps) {
  const shelterTypeLabel =
    shelterTypeOptions.find(
      (shelterOption) =>
        shelterOption.value === shelter.shelter_details.shelter_type
    ) || shelter.shelter_details.shelter_type;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {shelter.shelter_details.shelter_name}
        </h3>

        <div className="text-sm text-gray-600 mb-4">
          <p className="mb-1">
            <span className="font-medium">Тип:</span>{" "}
            {shelterTypeLabel?.label || shelterTypeLabel}
          </p>
          <p className="mb-1">
            <span className="font-medium">Розташування:</span>{" "}
            {shelter.shelter_details.location}
          </p>
          {shelter.shelter_details.website && (
            <p className="mb-1">
              <span className="font-medium">Вебсайт:</span>{" "}
              <a
                href={shelter.shelter_details.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {shelter.shelter_details.website.replace(/^https?:\/\//, "")}
              </a>
            </p>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-4 line-clamp-3">
          {shelter.shelter_details.description || "Опису не надано"}
        </div>

        <div className="flex justify-between items-start flex-col sm:flex-row sm:items-center mt-auto">
          <span className="text-sm text-gray-500 mb-2 sm:mb-0">
            {shelter.animals_count || 0}{" "}
            {shelter.animals_count === 1
              ? "тварина доступна"
              : "доступних тварин"}
          </span>

          <Link
            href={`/shelters/${shelter.id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 text-center"
          >
            Перейти до притулку
          </Link>
        </div>
      </div>
    </div>
  );
}
