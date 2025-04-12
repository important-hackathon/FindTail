import React, { ChangeEvent } from "react";

interface TextInputFormDataProps {
  value: string;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  type: "email" | "password" | "text" | "date";
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}

const TextInputFormData = ({
  value,
  handleChange,
  label,
  name,
  type,
  placeholder,
  required = false,
}: TextInputFormDataProps) => {
  return (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        required={required}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
    </>
  );
};

export default TextInputFormData;
