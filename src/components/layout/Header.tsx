'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function Header() {
  const { user, profile, loading, signOut, isVolunteer, isShelter } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Головна', href: '/' },
    { name: 'Пошук', href: '/animals' },
    { name: 'Каталог', href: '/shelters' },
    { name: 'Контакти', href: '/contacts' },
    { name: 'Кабінет', href: '/dashboard' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
      <header className="absolute top-0 left-0 w-full bg-[#FDF5EB] py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className='z-50'>
                <Link href="/">
                    <Image
                      src="/assets/images/findtail-logo.svg"
                      alt="FindTail Logo"
                      width={100}
                      height={40}
                    />
                </Link>
            </div>

          <nav className="hidden md:flex gap-10 text-[#432907] font-bold text-sm uppercase z-50">
            {navigation.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className={`transition hover:opacity-80 ${
                        isActive(item.href) ? 'underline underline-offset-4' : ''
                    }`}
                >
                  {item.name}
                </Link>
            ))}
          </nav>
        </div>
      </header>
  );
}
