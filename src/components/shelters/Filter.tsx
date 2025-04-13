import { ChevronDown } from "lucide-react";
import { ChangeEvent, ReactNode } from "react";

interface FilterProps {
  value: string | number;
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  items: { value: string | number; label: string }[];
  children?: ReactNode;
}

const Filter = ({
  value,
  handleChange,
  name,
  items,
  children,
}: FilterProps) => {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={handleChange}
        className="w-full px-3 appearance-none py-2 border bg-[#D7DDE7] border-gray-300 rounded-full focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-bold truncate "
      >
        {children}
        {items.map((item) => (
          <option
            className="text-[#432907]"
            key={item.value}
            value={item.value}
          >
            {item.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#432907]">
        <ChevronDown color="#432907" size={20} strokeWidth={4} />
      </div>
    </div>
  );
};

export default Filter;
