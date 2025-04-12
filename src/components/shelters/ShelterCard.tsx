import { shelterTypeOptions } from "@/constants/shelterTypeOptions";
import Link from "next/link";

interface ShelterCardProps {
  shelter: any;
}

export default function ShelterCard({ shelter }: ShelterCardProps) {

  // Отримання безпечних значень з перевіркою на null/undefined
  const shelterName = shelter.shelter_details?.shelter_name || 'Невідомий притулок';
  const shelterType = shelterTypeOptions.find(
      (shelterOption) =>
        shelterOption.value === shelter.shelter_details?.shelter_type
    ) || shelter.shelter_details.shelter_type.replace('_', ' ');
  const shelterLocation = shelter.shelter_details?.location || 'Невідоме розташування';
  const shelterWebsite = shelter.shelter_details?.website || '';
  const shelterDescription = shelter.shelter_details?.description || 'Опису не надано';
  const animalsCount = shelter.animals_count || 0;


  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {shelterName}
        </h3>

        <div className="text-sm text-gray-600 mb-4">
          <p className="mb-1">
            <span className="font-medium">Тип:</span>{" "}
            {shelterType?.label || shelterType}
          </p>
          <p className="mb-1">
            <span className="font-medium">Розташування:</span>{" "}
            {shelterLocation}
          </p>
          {shelterWebsite && (
            <p className="mb-1">
              <span className="font-medium">Вебсайт:</span>{" "}
              <a
                href={shelterWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {shelterWebsite.replace(/^https?:\/\//, "")}
              </a>
            </p>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-4 line-clamp-3">
          {shelterDescription}
        </div>

        <div className="flex justify-between items-start flex-col sm:flex-row sm:items-center mt-auto">
          <span className="text-sm text-gray-500 mb-2 sm:mb-0">
            {animalsCount || 0}{" "}
            {animalsCount === 1
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