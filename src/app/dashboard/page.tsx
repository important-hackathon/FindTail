'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, profile, loading, isVolunteer, isShelter } = useAuth();
  const router = useRouter();
  const [loadingState, setLoadingState] = useState('initial'); // 'initial', 'redirecting', 'error'
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Якщо завантаження AuthContext завершилось
    if (!loading) {
      // Якщо користувач не авторизований, перенаправляємо на сторінку входу
      if (!user) {
        setLoadingState('redirecting');
        router.push('/auth/login');
        return;
      }

      // Якщо профіль не завантажився або має проблеми, але користувач авторизований
      if (!profile) {
        // Встановлюємо таймаут для запобігання нескінченного завантаження
        const timer = setTimeout(() => {
          setLoadingState('error');
          setError('Не вдалося завантажити дані профілю. Спробуйте оновити сторінку або увійти в систему знову.');
        }, 5000); // 5 секунд очікування
        
        return () => clearTimeout(timer);
      }
      
      // Користувач авторизований і профіль доступний,
      // вирішуємо, куди перенаправити користувача
      if (profile) {
        setLoadingState('redirecting');
        
        if (isVolunteer) {
          router.push('/dashboard/volunteer');
        } else if (isShelter) {
          router.push('/dashboard/shelter');
        } else {
          // Якщо тип користувача не визначено
          setLoadingState('error');
          setError('Не вдалося визначити тип користувача. Зверніться до адміністратора.');
        }
      }
    }
  }, [loading, user, profile, isVolunteer, isShelter, router]);

  // Рендеримо різні стани
  if (loadingState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Помилка</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-between">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Оновити сторінку
            </button>
            <button 
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Увійти знову
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Стан завантаження
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-blue-200 mb-4"></div>
        <p className="text-gray-600">
          {loadingState === 'redirecting' 
            ? 'Перенаправлення на панель управління...' 
            : 'Завантаження...'}
        </p>
      </div>
    </div>
  );
}