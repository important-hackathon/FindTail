import { Dispatch, SetStateAction } from "react";

interface ShelterSelectProps {
  shelterType: string;
  setShelterType: Dispatch<SetStateAction<string>>;
  label: string;
  items: { value: string; label: string }[];
}

const ShelterSelect = ({
  label,
  shelterType,
  setShelterType,
  items,
}: ShelterSelectProps) => {
  return (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={shelterType}
        onChange={(e) => setShelterType(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Всі типи</option>
        {items.map((item, index) => (
          <option key={item.value + index} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </>
  );
};

export default ShelterSelect;
