import { Dispatch, SetStateAction } from "react";

interface SearchSheltersProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  placeholder?: string;
}

const SearchShelters = ({
  searchQuery,
  setSearchQuery,
  placeholder,
}: SearchSheltersProps) => {
  return (
    <div className="flex-1">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-full bg-[#D7DDE7] focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export default SearchShelters;
