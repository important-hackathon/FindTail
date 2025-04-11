'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mainNavigation } from '@/constants/navigation';
import clsx from 'clsx';
import Image from 'next/image';

export default function BurgerMenu() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const [visible, setVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    const openMenu = () => {
        setVisible(true);
        setTimeout(() => setAnimateIn(true), 10);
    };

    const closeMenu = () => {
        setAnimateIn(false);
        setTimeout(() => setVisible(false), 400);
    };

    return (
        <>
            <button
                onClick={openMenu}
                className="text-[#432907] flex items-center relative z-50"
                aria-label="Відкрити меню"
            >
                <Menu className="w-7 h-7" />
            </button>

            {visible && (
                <div
                    className={clsx(
                        'fixed inset-0 bg-[#FDF5EB] z-[100] flex flex-col items-center justify-center px-6 transition-all duration-400 ease-in-out',
                        animateIn
                            ? 'translate-y-0 opacity-100 pointer-events-auto'
                            : '-translate-y-full opacity-0 pointer-events-none'
                    )}
                >
                    <div className="absolute top-5 left-5">
                        <Link href="/">
                            <Image
                                src="/assets/images/findtail-logo.svg"
                                alt="FindTail Logo"
                                width={100}
                                height={40}
                                onClick={closeMenu}
                            />
                        </Link>
                    </div>

                    <button
                        onClick={closeMenu}
                        className="absolute top-5 right-5 text-[#432907]"
                        aria-label="Закрити меню"
                    >
                        <X className="w-7 h-7" />
                    </button>

                    <nav className="flex flex-col items-center gap-6 text-[#432907] font-bold text-lg uppercase">
                        {mainNavigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={closeMenu}
                                className={clsx(
                                    'transition',
                                    isActive(item.href) ? 'underline underline-offset-4' : ''
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {user && (
                            <button
                                onClick={() => {
                                    signOut();
                                    closeMenu();
                                }}
                                className="flex items-center gap-2 text-[#432907] hover:underline transition text-base font-medium mt-4"
                            >
                                <LogOut className="w-5 h-5" />
                                Вийти
                            </button>
                        )}
                    </nav>
                </div>
            )}
        </>
    );
}
