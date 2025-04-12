import type { Metadata } from 'next';
import { Montserrat_Alternates } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';

const montserrat = Montserrat_Alternates({
    subsets: ['latin'],
    display: 'swap',
    weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
    title: 'FindTail',
    description: 'Connecting animal shelters with people who want to help',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={montserrat.className}>
        <AuthProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-grow mt-16">
                    {children}
                </main>
            </div>
        </AuthProvider>
      </body>
    </html>
  );
}

