// File: src/app/contacts/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactsPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // You'd typically send this to your backend or a service like EmailJS
      // For now, we'll just store it in Supabase as a contact request
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          user_id: user?.id || null,
        });

      if (error) throw error;

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[#432907] mb-4">Зв'язатись з нами</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Маєте питання або пропозиції? Ми завжди раді спілкуванню! Заповніть форму нижче, і ми зв'яжемося з вами якнайшвидше.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {submitted ? (
            <div className="p-8 text-center">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Дякуємо за повідомлення!</h3>
              <p className="text-gray-600 mb-6">
                Ми отримали ваше звернення і зв'яжемося з вами найближчим часом.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Надіслати ще одне повідомлення
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ім'я *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тема *
                </label>
                <select
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Оберіть тему</option>
                  <option value="general">Загальне питання</option>
                  <option value="adoption">Питання про усиновлення</option>
                  <option value="shelter">Питання про притулок</option>
                  <option value="volunteer">Питання про волонтерство</option>
                  <option value="donate">Питання про пожертви</option>
                  <option value="other">Інше</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Повідомлення *
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Надсилання...' : 'Надіслати повідомлення'}
              </button>
            </form>
          )}
        </div>

        <div>
          <div className="bg-[#FDF5EB] rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-[#432907] mb-4">Контактна інформація</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                  <MapPin className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Адреса</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    вул. Симоненка, 10<br />
                    Львів, 79000<br />
                    Україна
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                  <Phone className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Телефон</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    +380 (32) 123-45-67<br />
                    +380 (50) 123-45-67
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Email</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    info@findtail.ua<br />
                    help@findtail.ua
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Години роботи</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Пн-Пт: 9:00 - 18:00<br />
                    Сб: 10:00 - 15:00<br />
                    Нд: Вихідний
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-[#432907] mb-4">Ми у соціальних мережах</h3>
            <p className="text-gray-600 mb-4">
              Слідкуйте за нами у соціальних мережах, щоб бути в курсі останніх новин та історій про врятованих тварин.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12.07c0-5.52-4.48-10-10-10s-10 4.48-10 10c0 4.96 3.66 9.09 8.44 9.84v-6.95h-2.54v-2.89h2.54v-2.2c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.27c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.89h-2.33v6.95C18.34 21.16 22 17.02 22 12.07z" />
                </svg>
              </a>
              <a href="#" className="p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c-2.714 0-3.055.012-4.122.06-1.064.048-1.79.218-2.428.465a4.901 4.901 0 0 0-1.772 1.153A4.902 4.902 0 0 0 2.525 5.45c-.247.637-.417 1.363-.465 2.428C2.012 8.945 2 9.286 2 12s.012 3.055.06 4.122c.048 1.064.218 1.79.465 2.428a4.902 4.902 0 0 0 1.153 1.772 4.902 4.902 0 0 0 1.772 1.153c.637.247 1.363.417 2.428.465 1.067.048 1.408.06 4.122.06s3.055-.012 4.122-.06c1.064-.048 1.79-.218 2.428-.465a4.902 4.902 0 0 0 1.772-1.153 4.902 4.902 0 0 0 1.153-1.772c.247-.637.417-1.363.465-2.428.048-1.067.06-1.408.06-4.122s-.012-3.055-.06-4.122c-.048-1.064-.218-1.79-.465-2.428a4.902 4.902 0 0 0-1.153-1.772 4.901 4.901 0 0 0-1.772-1.153c-.637-.247-1.363-.417-2.428-.465C15.055 2.012 14.714 2 12 2zm0 1.802c2.67 0 2.986.01 4.04.058.976.045 1.505.207 1.858.344.466.181.8.399 1.15.748.35.35.566.684.748 1.15.137.353.3.882.344 1.857.048 1.055.058 1.37.058 4.041 0 2.67-.01 2.986-.058 4.04-.045.976-.207 1.505-.344 1.858a3.1 3.1 0 0 1-.748 1.15c-.35.35-.684.566-1.15.748-.353.137-.882.3-1.857.344-1.054.048-1.37.058-4.041.058-2.67 0-2.987-.01-4.04-.058-.976-.045-1.505-.207-1.858-.344a3.098 3.098 0 0 1-1.15-.748 3.098 3.098 0 0 1-.748-1.15c-.137-.353-.3-.882-.344-1.857-.048-1.055-.058-1.37-.058-4.041 0-2.67.01-2.986.058-4.04.045-.976.207-1.505.344-1.858.181-.466.399-.8.748-1.15.35-.35.684-.566 1.15-.748.353-.137.882-.3 1.857-.344 1.055-.048 1.37-.058 4.041-.058zm0 3.064a5.134 5.134 0 1 0 0 10.268 5.134 5.134 0 0 0 0-10.268zm0 8.466a3.332 3.332 0 1 1 0-6.664 3.332 3.332 0 0 1 0 6.664zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                </svg>
              </a>
              <a href="#" className="p-3 bg-blue-400 text-white rounded-full hover:bg-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z" />
                </svg>
              </a>
              <a href="#" className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-xl font-bold text-[#432907] mb-6 text-center">Як нас знайти</h3>
        <div className="rounded-lg overflow-hidden shadow-lg h-96">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2573.0377391419395!2d24.00589531571181!3d49.83268537939651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473add6785a9abe3%3A0x9436b7d934c55d7e!2sLviv%2C%20Lviv%20Oblast%2C%20Ukraine%2C%2079000!5e0!3m2!1sen!2sus!4v1650376228382!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    </div>
  );
}