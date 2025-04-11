'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { mainNavigation } from '@/constants/navigation';
import BurgerMenu from './BurgerMenu';

export default function Header() {
    const { user, signOut, loading } = useAuth();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <header className="absolute top-0 left-0 w-full bg-[#FDF5EB] py-4 px-6 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div>
                    <Link href="/">
                        <Image
                            src="/assets/images/findtail-logo.svg"
                            alt="FindTail Logo"
                            width={100}
                            height={40}
                        />
                    </Link>
                </div>

                <nav className="hidden md:flex gap-10 text-[#432907] font-bold text-sm uppercase">
                    {mainNavigation.map((item) => (
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

                {/*<div className="hidden md:flex items-center gap-4 text-sm font-medium text-[#432907]">*/}
                {/*    {!loading && user && (*/}
                {/*        <button*/}
                {/*            onClick={signOut}*/}
                {/*            className="hover:underline underline-offset-2 transition"*/}
                {/*        >*/}
                {/*            Вийти*/}
                {/*        </button>*/}
                {/*    )}*/}
                {/*</div>*/}

                <div className="md:hidden">
                    <BurgerMenu />
                </div>
            </div>
        </header>
    );
}
