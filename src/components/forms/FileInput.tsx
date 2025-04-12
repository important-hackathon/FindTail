import React, { ChangeEvent } from "react";

interface FileInputProps {
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

const FileInput = ({ handleImageChange, label }: FileInputProps) => {
  return (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </>
  );
};

export default FileInput;
