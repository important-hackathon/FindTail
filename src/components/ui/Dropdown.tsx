'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
    label: string;
    items: string[];
}

export default function Dropdown({ label, items }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (item: string) => {
        setSelected(item);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="bg-[#FDF5EB] text-[#432907] px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 min-w-[120px] shadow-sm border border-transparent hover:border-[#e0d7cb] transition"
            >
                {selected || label}
                <ChevronDown size={16} className={` transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <ul className="absolute left-0 mt-2 w-full bg-[#FDF5EB] text-[#432907] rounded-[10px] py-2 shadow-md z-50">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className="px-4 py-1.5 text-sm hover:bg-[#f1e8da] cursor-pointer"
                            onClick={() => handleSelect(item)}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}