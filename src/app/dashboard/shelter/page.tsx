'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { 
  PawPrint, 
  Search, 
  MessageCircle, 
  FileEdit, 
  Home,
  BarChart3,
  LogOut
} from 'lucide-react';

export default function ShelterDashboard() {
  const [pendingFoundPets, setPendingFoundPets] = useState(0);
  const [loadingData, setLoadingData] = useState(true); // Renamed from loading to avoid conflict
  const pathname = usePathname();
  const { user, profile, signOut, loading: authLoading } = useAuth(); // Renamed to authLoading
  const router = useRouter();

  // Add protection - redirect if not authenticated or not a shelter
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log("No user found, redirecting to login");
        router.push('/auth/login');
      } else if (!profile || profile.user_type !== 'shelter') {
        console.log("Not a shelter profile, redirecting");
        router.push('/dashboard');
      }
    }
  }, [user, profile, authLoading, router]);

  // Don't render anything while loading or if not authenticated correctly
  if (authLoading || !user || !profile || profile.user_type !== 'shelter') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-blue-200 mb-4"></div>
          <p className="text-gray-600">Перевірка авторизації...</p>
        </div>
      </div>
    );
  }

  // Get shelter details or fallback (now we know profile exists)
  const shelterName = profile.shelter_details?.shelter_name || profile.full_name || 'Your Shelter';
  const shelterType = profile.shelter_details?.shelter_type?.replace('_', ' ') || 'Animal Shelter';
  const location = profile.shelter_details?.location || profile.address || 'Unknown Location';
  
  const isActive = (href: string) => pathname.startsWith(href);

  const navLinks = [
    { name: 'Головна', href: '/dashboard/shelter' },
    { name: 'Тварини', href: '/dashboard/shelter/animals' },
    { name: 'Знайдені тварини', href: '/dashboard/shelter/found-pets', showBadge: pendingFoundPets > 0, badgeCount: pendingFoundPets },
    { name: 'Повідомлення', href: '/dashboard/messages' },
  ];

  useEffect(() => {
    // Count pending found pet reports
    const countPendingReports = async () => {
      try {
        if (!profile?.id) return;
        
        const { count, error } = await supabase
          .from('found_animal_reports')
          .select('*', { count: 'exact', head: true })
          .or(`preferred_shelter_id.eq.${profile.id},preferred_shelter_id.is.null`)
          .eq('status', 'pending');
          
        if (error) throw error;
        
        setPendingFoundPets(count || 0);
      } catch (err) {
        console.error('Error counting pending reports:', err);
      } finally {
        setLoadingData(false);
      }
    };
    
    countPendingReports();
  }, [profile?.id]);

  // Define dashboard action cards
  const actionCards = [
    {
      title: "Керувати тваринами",
      description: "Додавайте або оновлюйте інформацію про тварин у вашому притулку",
      icon: <PawPrint size={24} className="text-[#A9BFF2]" />,
      path: "/dashboard/shelter/animals",
      active: true
    },
    {
      title: "Знайдені тварини",
      description: `Переглянути повідомлення про знайдених тварин${pendingFoundPets > 0 ? ` (${pendingFoundPets} нових)` : ''}`,
      icon: <Search size={24} className="text-[#A9BFF2]" />,
      path: "/dashboard/shelter/found-pets",
      highlight: pendingFoundPets > 0,
      active: true
    },
    {
      title: "Повідомлення",
      description: "Переглянути та відповісти на повідомлення",
      icon: <MessageCircle size={24} className="text-[#A9BFF2]" />,
      path: "/dashboard/messages",
      active: true
    },
    {
      title: "Профіль притулку",
      description: "Оновіть інформацію про ваш притулок",
      icon: <FileEdit size={24} className="text-[#A9BFF2]" />,
      path: "/dashboard/shelter/profile",
      active: false
    },
    {
      title: "Усиновлення",
      description: "Керувати запитами на усиновлення тварин",
      icon: <Home size={24} className="text-[#A9BFF2]" />,
      path: "#",
      active: false
    },
    {
      title: "Статистика",
      description: "Перегляд статистики вашого притулку",
      icon: <BarChart3 size={24} className="text-[#A9BFF2]" />,
      path: "#",
      active: false
    },
  ];

  return (
    <div className="bg-[#FDF5EB] min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top navigation */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-16 h-16 rounded-full bg-[#E4EAF1] flex items-center justify-center text-[#432907] text-2xl font-bold">
                {shelterName?.charAt(0) || 'П'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#432907]">{shelterName}</h1>
                <p className="text-gray-500 text-sm">{location}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm rounded-full transition-colors ${
                    isActive(link.href)
                      ? 'bg-[#A9BFF2] text-white'
                      : 'bg-gray-100 text-[#432907] hover:bg-gray-200'
                  }`}
                >
                  {link.name}
                  {link.showBadge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {link.badgeCount}
                    </span>
                  )}
                </Link>
              ))} */}
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <LogOut size={16} />
                Вийти
              </button>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#432907] mb-6">Дії</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionCards.map((card, index) => (
            card.active ? (
              <Link
                key={index}
                href={card.path}
                className={`relative bg-white rounded-lg shadow-md p-6 flex flex-col transition-transform hover:scale-[1.02] hover:shadow-lg ${
                  card.highlight ? 'ring-2 ring-red-400' : ''
                }`}
              >
                {card.highlight && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingFoundPets}
                  </span>
                )}
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#e4eaf1] flex items-center justify-center mr-4">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#432907]">{card.title}</h3>
                </div>
                <p className="text-gray-600 flex-grow">{card.description}</p>
                <div className="mt-4 text-[#A9BFF2] font-medium flex items-center">
                  Перейти 
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                    <path d="M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 3.33334L12.6667 8.00001L8 12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            ) : (
              <div
                key={index}
                className="relative bg-gray-100 rounded-lg shadow-md p-6 flex flex-col cursor-not-allowed opacity-70"
              >
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#e4eaf1] flex items-center justify-center mr-4">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#432907]">{card.title}</h3>
                </div>
                <p className="text-gray-600 flex-grow">{card.description}</p>
                <div className="mt-4 text-gray-500 font-medium">
                  Скоро буде
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}