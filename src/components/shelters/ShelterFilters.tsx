import { shelterTypeOptions } from "@/constants/shelterTypeOptions";
import Filter from "./Filter";
import { ChangeEvent } from "react";
import { ratingOptions } from "@/constants/shelterRating";
import { shelterStatusOptions } from "@/constants/shelterStatusOptions";

interface ShelterFiltersProps {
  value: {
    shelter_type: string;
    rating: string;
    free_places: string;
    location: string;
  };
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const ShelterFilters = ({ value, handleChange }: ShelterFiltersProps) => {
  return (
    <div className="text-[#432907]">
      <h4 className="text-center font-bold mb-5">Фільтри</h4>

      <div className="flex flex-col gap-3">
        <Filter
          items={shelterTypeOptions}
          name="shelter_type"
          value={value.shelter_type}
          handleChange={handleChange}
        >
          <option value="">Тип притулку</option>
        </Filter>

        <Filter
          items={ratingOptions}
          name="rating"
          value={value.rating}
          handleChange={handleChange}
        >
          <option value="">Рейтинг</option>
        </Filter>

        <Filter
          items={[
            { value: "Львів", label: "Львів" },
            { value: "Киїів", label: "Киїів" },
          ]}
          name="location"
          value={value.location}
          handleChange={handleChange}
        >
          <option value="">Локація</option>
        </Filter>

        <Filter
          items={shelterStatusOptions}
          name="free_places"
          value={value.free_places}
          handleChange={handleChange}
        >
          <option value="">Вільні місця</option>
        </Filter>
      </div>
    </div>
  );
};

export default ShelterFilters;
