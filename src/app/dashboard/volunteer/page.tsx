"use client";

import ActionCard from "@/components/dashboard/ActionCard";
import SignOutButton from "@/components/dashboard/SignOutButton";
import { useAuth } from "@/contexts/AuthContext";

const cards = [
  {
    title: "Знайти тварин",
    description: "Переглядайте тварин, які потребують усиновлення",
    buttonText: "Переглянути тварин",
    path: "/animals",
  },
  {
    title: "Збережені тварини",
    description: "Перегляньте тварин, яких ви зберегли",
    buttonText: "Переглянути збережене",
    path: "/dashboard/volunteer/favorites",
  },
  {
    title: "Повідомити про знайдену тварину",
    description: "Повідомте про тварину, яку ви знайшли",
    buttonText: "Повідомити про тварину",
    path: "/dashboard/volunteer/found",
  },
];

export default function VolunteerDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Панель управління</h1>
        <SignOutButton buttonText="Вийти" signOut={signOut} />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Ласкаво просимо, {profile?.full_name}
        </h2>
        <p>Розпочніть перегляд доступних тварин або зв'яжіться з притулками.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {cards.map((card, index) => (
          <ActionCard
            key={card.title + index}
            title={card.title}
            description={card.description}
            buttonText={card.buttonText}
            path={card.path}
          />
        ))}
      </div>
    </div>
  );
}
