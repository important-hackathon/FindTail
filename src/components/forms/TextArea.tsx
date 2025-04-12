import { ChangeEvent } from "react";

interface TextAreaProps {
  label: string;
  value: string;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  name: string;
  placeholder?: string;
  required?: boolean;
}

const TextArea = ({
  label,
  value,
  handleChange,
  name,
  placeholder,
  required = false,
}: TextAreaProps) => {
  return (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        name={name}
        rows={2}
        required={required}
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
    </>
  );
};

export default TextArea;
