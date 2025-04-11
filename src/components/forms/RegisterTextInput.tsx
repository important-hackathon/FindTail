"user client";

interface RegisterTextInputProps {
  value: string;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  type: "email" | "password" | "text" | "tel" | "url";
  label: string;
  name?: string;
}

const RegisterTextInput = ({
  value,
  handleChange,
  type,
  label,
  name,
}: RegisterTextInputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        required
        value={value}
        onChange={handleChange}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-[#D7DDE7]"
      />
    </div>
  );
};

export default RegisterTextInput;
