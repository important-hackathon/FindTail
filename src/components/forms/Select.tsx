import { ChangeEvent, ReactNode } from "react";

interface SelectProps {
  label: string;
  value: string;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  name: string;
  items: { value: string; label: string }[];
  children?: ReactNode;
  required?: boolean;
}

const Select = ({
  label,
  handleChange,
  value,
  items,
  name,
  required = false,
  children,
}: SelectProps) => {
  return (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        required={required}
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {children}
        {items.map((item) => (
          <option value={item.value}>{item.label}</option>
        ))}
      </select>
    </>
  );
};

export default Select;
