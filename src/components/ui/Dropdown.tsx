'use client';

import { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

interface Option {
    value: string;
    label: string;
}

interface DropdownProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;

    bgColor?: string;
    textColor?: string;
    hoverColor?: string;
}

export default function Dropdown({
                                     name,
                                     value,
                                     onChange,
                                     options = [],
                                     placeholder = 'Оберіть...',
                                     bgColor = '#DDE3EF',
                                     textColor = '#432907',
                                     hoverColor = '#e6dfd0',
                                 }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((opt) => opt.value === value);

    const handleSelect = (option: Option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{ backgroundColor: bgColor, color: textColor }}
                className="px-4 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-2 min-w-[120px]"
            >
                {selected?.label || placeholder}
                <IoIosArrowDown className="text-xs" />
            </button>

            {isOpen && (
                <ul
                    className="absolute left-0 mt-0.5 w-full border border-gray-200 rounded-xl shadow-md z-50"
                    style={{ backgroundColor: bgColor }}
                >
                    {options.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className="px-4 py-2 cursor-pointer text-sm transition"
                            style={{
                                color: textColor,
                                backgroundColor: value === option.value ? hoverColor : 'transparent',
                                fontWeight: value === option.value ? 600 : 400,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    value === option.value ? hoverColor : 'transparent')
                            }
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
