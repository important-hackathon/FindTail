"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Heart, 
  Send, 
  MessageCircle, 
  Home,
  DollarSign,
  LogOut,
  PawPrint,
  Cat,
  Dog,
  Award
} from 'lucide-react';

export default function VolunteerDashboard() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  const navLinks = [
    { name: 'Головна', href: '/dashboard/volunteer' },
    { name: 'Улюблені', href: '/dashboard/volunteer/favorites' },
    { name: 'Знайдена тварина', href: '/dashboard/volunteer/found' },
    { name: 'Повідомлення', href: '/dashboard/messages' },
  ];

  const actionCards = [
    {
      title: "Знайти тварин",
      description: "Переглядайте тварин, які потребують усиновлення",
      icon: <Search size={24} className="text-[#A9BFF2]" />,
      path: "/animals",
      active: true
    },
    {
      title: "Збережені тварини",
      description: "Перегляньте тварин, яких ви зберегли",
      icon: <Heart size={24} className="text-[#A9BFF2]" />,
      path: "/dashboard/volunteer/favorites",
      active: true
    },
    {
      title: "Знайдена тваринка",
      description: "Повідомте про тварину, яку ви знайшли",
      icon: <Send size={24} className="text-[#A9BFF2]" />,
      path: "/dashboard/volunteer/found",
      active: true
    },
    {
      title: "Повідомлення",
      description: "Перегляньте повідомлення від притулків",
      icon: <MessageCircle size={24} className="text-[#A9BFF2]" />,
      path: "/dashboard/messages",
      active: true
    },
    {
      title: "Притулки",
      description: "Перегляньте список притулків",
      icon: <Home size={24} className="text-[#A9BFF2]" />,
      path: "/shelters",
      active: true
    },
    {
      title: "Пожертви",
      description: "Підтримайте притулки пожертвою",
      icon: <DollarSign size={24} className="text-[#A9BFF2]" />,
      path: "/donate",
      active: true
    },
  ];

  // Additional feature cards
  const additionalCards = [
    {
      title: "Собаки",
      description: "Перегляньте список собак, які шукають дім",
      icon: <Dog size={24} className="text-[#A9BFF2]" />,
      path: "/animals/dogs",
      active: false
    },
    {
      title: "Коти",
      description: "Перегляньте список котів, які шукають дім",
      icon: <Cat size={24} className="text-[#A9BFF2]" />,
      path: "/animals/cats",
      active: false
    },
    {
      title: "Сертифікати",
      description: "Ваші сертифікати волонтера та досягнення",
      icon: <Award size={24} className="text-[#A9BFF2]" />,
      path: "/volunteer/certificates",
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
              <div className="w-16 h-16 rounded-full bg-[#E4EAF1] flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-[#432907] text-2xl font-bold">
                    {profile?.full_name?.charAt(0) || 'В'}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#432907]">
                  {profile?.full_name || 'Волонтер'}
                </h1>
                <p className="text-gray-500 text-sm">Волонтер</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 text-sm rounded-full transition-colors ${
                    isActive(link.href)
                      ? 'bg-[#A9BFF2] text-white'
                      : 'bg-gray-100 text-[#432907] hover:bg-gray-200'
                  }`}
                >
                  {link.name}
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
                className="bg-white rounded-lg shadow-md p-6 flex flex-col transition-transform hover:scale-[1.02] hover:shadow-lg"
              >
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

        <h2 className="text-2xl font-bold text-[#432907] mt-12 mb-6">Додаткові можливості</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {additionalCards.map((card, index) => (
            card.active ? (
              <Link
                key={index}
                href={card.path}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col transition-transform hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#e4eaf1] flex items-center justify-center mr-4">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#432907]">{card.title}</h3>
                </div>
                <p className="text-gray-600 flex-grow">{card.description}</p>
                <div className="mt-4 text-[#A9BFF2] font-medium flex items-center">
                  Переглянути
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