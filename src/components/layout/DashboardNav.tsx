'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardNav() {
    const { isVolunteer, isShelter } = useAuth();
    const pathname = usePathname();

    const dashboardNav = isVolunteer
        ? [
            { name: 'Улюблені', href: '/dashboard/volunteer/favorites' },
            { name: 'Знайдена тварина', href: '/dashboard/volunteer/found' },
            { name: 'Повідомлення', href: '/dashboard/messages' },
        ]
        : isShelter
            ? [
                { name: 'Тварини', href: '/dashboard/shelter/animals' },
                { name: 'Повідомлення', href: '/dashboard/messages' },
            ]
            : [];

    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <div className="bg-[#FDF5EB] border-t border-[#e3d7c5] shadow-sm py-3 px-6 md:mt-0 mt-3">
            <div className="max-w-7xl mx-auto flex justify-end gap-6 text-[#432907] font-semibold text-sm">
                {dashboardNav.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`transition hover:text-[#2c1e0e] ${
                            isActive(item.href) ? 'underline underline-offset-4' : ''
                        }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
