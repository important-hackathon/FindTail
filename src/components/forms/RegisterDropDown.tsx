import React from "react";

interface RegisterDropDownProps {
  value: string;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  label: string;
  name: string;
  options: { value: string; label: string }[];
}

const RegisterDropDown = ({
  value,
  handleChange,
  label,
  name,
  options,
}: RegisterDropDownProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        className="mt-1 block w-full px-3 py-2 border bg-[#D7DDE7] border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((option, index) => (
          <option key={option.value + index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RegisterDropDown;
