import { shelterTypeOptions } from "@/constants/shelterTypeOptions";
import React from "react";

interface ShelterInfoProps {
  shelter: any;
}

const ShelterInfo = ({ shelter }: ShelterInfoProps) => {
  const shelterTypeLabel =
    shelterTypeOptions.find(
      (shelterOption) =>
        shelterOption.value === shelter.shelter_details.shelter_type
    ) || shelter.shelter_details.shelter_type;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Інформація про притулок</h2>
      <div className="space-y-2 text-gray-600">
        <p>
          <span className="font-medium">Тип:</span>{" "}
          {shelterTypeLabel?.label || shelterTypeLabel}
        </p>
        <p>
          <span className="font-medium">Розташування:</span>{" "}
          {shelter.shelter_details.location}
        </p>
        <p>
          <span className="font-medium">Контакти:</span>{" "}
          {shelter.phone_number || "Не вказано"}
        </p>
        {shelter.shelter_details.website && (
          <p>
            <span className="font-medium">Вебсайт:</span>{" "}
            <a
              href={shelter.shelter_details.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {shelter.shelter_details.website}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default ShelterInfo;
