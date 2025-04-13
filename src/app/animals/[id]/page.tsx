'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Gallery from '@/components/ui/Gallery';
import { ArrowLeft, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function AnimalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isVolunteer } = useAuth();

  const [animal, setAnimal] = useState<any>(null);
  const [shelter, setShelter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactForm, setContactForm] = useState({ message: '', showForm: false });
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => { fetchAnimal(); }, [id]);
  useEffect(() => { if (user && animal) checkIfFavorite(); }, [user, animal]);

  const fetchAnimal = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
          .from('animals')
          .select(`*, images:animal_images(*), shelter:profiles!inner(*, shelter_details(*))`)
          .eq('id', id)
          .single();

      if (error) throw error;
      setAnimal(data);
      setShelter(data.shelter);
    } catch (err: any) {
      setError('Failed to load animal details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const { data } = await supabase
          .from('favorites')
          .select('id')
          .eq('animal_id', animal.id)
          .eq('user_id', user?.id)
          .single();

      setIsFavorite(!!data);
    } catch (err) {}
  };

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      if (isFavorite) {
        await supabase.from('favorites')
            .delete()
            .eq('animal_id', animal.id)
            .eq('user_id', user.id);
      } else {
        await supabase.from('favorites')
            .insert({ animal_id: animal.id, user_id: user.id });
      }
      setIsFavorite(!isFavorite);
    } catch {}
  };

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      setSending(true);
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: shelter.id,
        content: contactForm.message,
      });

      if (error) throw error;
      setMessageSent(true);
      setContactForm({ message: '', showForm: false });
    } finally {
      setSending(false);
    }
  };

  const formatAge = () => {
    if (animal.age_years === 0 && animal.age_months === 0) return 'Unknown age';
    if (animal.age_years === 0) return `${animal.age_months} міс.`;
    if (animal.age_months === 0) return `${animal.age_years} р.`;
    return `${animal.age_years} р., ${animal.age_months} міс.`;
  };

  const getHealthStatusInfo = () => {
    switch (animal?.health_status) {
      case 'healthy':
        return { label: 'Healthy', color: 'bg-green-100 text-green-800' };
      case 'needs_care':
        return { label: 'Needs Care', color: 'bg-yellow-100 text-yellow-800' };
      case 'urgent':
        return { label: 'Urgent Care Needed', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const healthStatus = getHealthStatusInfo();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error || !animal) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error || 'Animal not found'}</div>
          <Link href="/animals" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Back to Animals
          </Link>
        </div>
    );
  }

  return (
      <div className="bg-[#FDF5EB] px-6 py-10 min-h-screen">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 border-[#A9BFF2] border-b pb-10">
          <div>
            <Link href="/animals" className="flex items-center justify-center gap-1 px-4 py-2 max-w-26 rounded-full text-sm font-semibold shadow mb-4 bg-[#D7DDE7] hover:bg-gray-700]">
              <ArrowLeft size={16} /> Назад
            </Link>
            <Gallery images={animal.images} />
          </div>

          <div className="flex flex-col justify-between text-[#432907]">
            <div>
              <div className="flex justify-between items-start gap-4 relative">
                <h1 className="text-3xl font-bold">{animal.name}</h1>

                <div className="absolute bottom-9 -left-7 md:bottom-5 md:-left-10">
                  <Image
                      src="/assets/images/pet-ears.svg"
                      alt="ears"
                      width={50}
                      height={50}
                  />
                </div>

                <div className="text-sm font-semibold text-right">
                  <div className="flex items-center justify-end gap-2 text-[#432907]">
                    <span className='text-[#A9BFF2]'><MapPin size={16} /></span> {shelter?.shelter_details?.location}
                  </div>
                  <p>
                    Притулок: “{shelter?.shelter_details?.shelter_name}”
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm space-y-1">
                <p><b>Вік:</b> {formatAge()}</p>
                <p><b>Стать:</b> {animal.gender}</p>
                <p><b>Стерилізований:</b> {animal.sterilized ? 'Так' : 'Ні'}</p>
                <p><b>Порода:</b> {animal.breed || '—'}</p>
                <p><b>Розмір:</b> {animal.size}</p>
                <p><b>Стан здоров’я:</b> {healthStatus.label}</p>
                <p><b>Вакцинація:</b> {animal.vaccinated ? 'Так' : 'Ні'}</p>
                <p><b>Звик до туалету:</b> {animal.house_trained ? 'Так' : 'Ні'}</p>
                <p className=''><b>Їсть:</b> {animal.food_preference || '—'}</p>
                <p className="border-[#A9BFF2] border-y text-sm py-4 mt-2">{animal.description || 'Опис відсутній'}</p>
              </div>

            </div>

            <div className="mt-6 pt-4 text-sm space-y-1">
              <p><b>Контакт:</b> {shelter?.shelter_details?.phone || '—'}</p>
              <p><b>Email:</b> {shelter?.email}</p>
              <p><b>Instagram:</b> @{shelter?.shelter_details?.instagram}</p>

              <div className=" flex justify-end">
                <button
                    onClick={toggleFavorite}
                    className={`mr-4 px-4 py-2 rounded-full text-sm font-semibold shadow ${
                        isFavorite ? 'bg-red-100 text-red-600' : 'bg-[#D7DDE7] text-gray-600'
                    }`}
                >
                  {isFavorite ? '❤️ В улюблених' : '🤍 Додати в улюблені'}
                </button>

                <button
                    onClick={() => setContactForm({ ...contactForm, showForm: true })}
                    className="bg-[#A9C5E2] hover:bg-[#90b4db] px-6 py-2 rounded-full text-sm font-semibold text-white shadow"
                >
                  Хочу забрати!
                </button>
              </div>
            </div>
          </div>
        </div>

        {contactForm.showForm && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Повідомлення про {animal.name}</h3>
                  <button onClick={() => setContactForm({ ...contactForm, showForm: false })}>
                    &times;
                  </button>
                </div>
                {messageSent ? (
                    <div className="bg-green-100 text-green-700 p-4 rounded-md">
                      Повідомлення надіслано!
                    </div>
                ) : (
                    <form onSubmit={handleContactFormSubmit} className="space-y-4">
                <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Ваше повідомлення..."
                />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setContactForm({ ...contactForm, showForm: false })}>
                          Скасувати
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          {sending ? 'Надсилання...' : 'Надіслати'}
                        </button>
                      </div>
                    </form>
                )}
              </div>
            </div>
        )}
      </div>
  );
}
