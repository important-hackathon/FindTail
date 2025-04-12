// File: src/app/donate/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function DonatePage() {
  const { user } = useAuth();
  const [donationAmount, setDonationAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Predefined donation amounts
  const predefinedAmounts = [50, 100, 200, 500];

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount);
    setCustomAmount(false);
  };

  const handleCustomAmountToggle = () => {
    setCustomAmount(true);
    setDonationAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setDonationAmount(value === '' ? '' : parseFloat(value));
    }
  };

  const handleAnonymousToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAnonymous(e.target.checked);
    if (e.target.checked) {
      setDonorName('Anonymous');
    } else {
      setDonorName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!donationAmount) {
      setError('Будь ласка, вкажіть суму пожертви');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, you would integrate with a payment processor here
      // This is just a simulation
      
      // Store donation record
      const { error: dbError } = await supabase
        .from('donations')
        .insert({
          amount: Number(donationAmount),
          donor_name: isAnonymous ? 'Anonymous' : donorName,
          donor_email: donorEmail,
          message: donorMessage,
          user_id: user?.id || null,
          payment_status: 'completed', // In reality, this would be updated after payment processing
          is_anonymous: isAnonymous
        });

      if (dbError) throw dbError;

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubmitted(true);
      
      // Reset form
      setDonationAmount('');
      setDonorName('');
      setDonorEmail('');
      setDonorMessage('');
      setIsAnonymous(false);
      
    } catch (err: any) {
      console.error('Error processing donation:', err);
      setError(err.message || 'Помилка обробки пожертви. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[#432907] mb-4">Допоможіть нашим хвостатим друзям</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ваша підтримка допомагає рятувати безпритульних тварин, забезпечувати їм медичну допомогу, 
          притулок та шанс знайти люблячу родину.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div className="space-y-8">
          <div className="bg-[#FDF5EB] rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold text-[#432907] mb-4">На що підуть ваші кошти</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                  <span className="text-lg">🏠</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Притулок</h3>
                  <p className="mt-1 text-gray-600">
                    Забезпечення комфортних умов проживання для тварин, що чекають на новий дім.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                  <span className="text-lg">🍖</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Харчування</h3>
                  <p className="mt-1 text-gray-600">
                    Якісне та збалансоване харчування для підтримки здоров'я тварин.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
                  <span className="text-lg">💉</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Ветеринарна допомога</h3>
                  <p className="mt-1 text-gray-600">
                    Лікування, вакцинація та стерилізація тварин для підтримки їхнього здоров'я.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-purple-100 rounded-full p-2">
                  <span className="text-lg">🎾</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Іграшки та обладнання</h3>
                  <p className="mt-1 text-gray-600">
                    Забезпечення тварин іграшками та необхідним обладнанням для активного життя.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-[#432907] mb-4">Наша фінансова прозорість</h2>
            <p className="text-gray-600 mb-4">
              Ми регулярно публікуємо звіти про використання коштів, щоб ви могли бачити, як саме ваші пожертви допомагають тваринам.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-bold text-lg text-blue-700">75%</h4>
                <p className="text-sm text-gray-600">Догляд за тваринами</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-bold text-lg text-green-700">15%</h4>
                <p className="text-sm text-gray-600">Ремонт притулків</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-bold text-lg text-purple-700">10%</h4>
                <p className="text-sm text-gray-600">Адміністрування</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {submitted ? (
            <div className="p-8 text-center">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Дякуємо за вашу пожертву!</h3>
              <p className="text-gray-600 mb-6">
                Ваша підтримка допоможе нам рятувати та піклуватися про більше тварин.
                Ми надіслали деталі вашої пожертви на вказану електронну адресу.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Зробити ще одну пожертву
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8">
              <h2 className="text-2xl font-bold text-[#432907] mb-6">Зробити пожертву</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оберіть суму (UAH)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {predefinedAmounts.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAmountSelect(amount)}
                      className={`py-2 rounded-md border ${
                        donationAmount === amount && !customAmount
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {amount} UAH
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="custom-amount"
                    checked={customAmount}
                    onChange={handleCustomAmountToggle}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="custom-amount" className="text-sm text-gray-700">
                    Інша сума
                  </label>
                  {customAmount && (
                    <input
                      type="text"
                      value={donationAmount === '' ? '' : donationAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Введіть суму"
                      className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ваше ім'я
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  disabled={isAnonymous}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Для отримання квитанції"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Повідомлення (необов'язково)
                </label>
                <textarea
                  rows={3}
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ваше повідомлення або побажання"
                />
              </div>

              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={handleAnonymousToggle}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                  Зробити анонімний внесок
                </label>
              </div>

              <div className="border-t pt-6 border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Обробка...' : 'Підтвердити пожертву'}
                </button>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Безпечна обробка платежів через нашу платіжну систему</p>
                <div className="flex justify-center mt-2 space-x-2">
                  <span className="text-gray-400">💳</span>
                  <span className="text-gray-400">🔒</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-[#432907] mb-6 text-center">Наші успішні історії</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-52 relative">
              <Image 
                src="/assets/images/success-story-1.jpg" 
                alt="Success story" 
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-[#432907] mb-2">Історія Барні</h3>
              <p className="text-gray-600 mb-4">
                Барні був знайдений на вулиці в дуже поганому стані. Завдяки вашим пожертвам, ми змогли
                забезпечити йому необхідне лікування, і тепер він живе щасливим життям у новій родині.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-52 relative">
              <Image 
                src="/assets/images/success-story-2.jpg" 
                alt="Success story" 
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-[#432907] mb-2">Історія Лілі</h3>
              <p className="text-gray-600 mb-4">
                Лілі була знайдена у коробці біля смітника. Завдяки підтримці донорів, ми змогли
                виходити її та знайти їй люблячих господарів, які тепер не уявляють життя без неї.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-52 relative">
              <Image 
                src="/assets/images/success-story-3.jpg" 
                alt="Success story" 
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-[#432907] mb-2">Історія Рекса</h3>
              <p className="text-gray-600 mb-4">
                Рекс потребував складної операції після нещасного випадку. Завдяки пожертвам наших
                донорів, ми змогли оплатити операцію, і тепер Рекс здоровий та щасливий.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}