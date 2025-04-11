"user client";

import { ChangeEvent, Dispatch } from "react";

interface TextInputProps {
  value: string;
  handleChange: Dispatch<React.SetStateAction<string>>;
  type: "email" | "password" | "text";
  label: string;
}

const TextInput = ({ value, handleChange, type, label }: TextInputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange(e.target.value)
        }
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-[#D7DDE7]"
      />
    </div>
  );
};

export default TextInput;
