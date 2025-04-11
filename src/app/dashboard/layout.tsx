import { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import DashboardNav from '@/components/layout/DashboardNav';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Header />
            <DashboardNav />
            <main>{children}</main>
        </>
    );
}
