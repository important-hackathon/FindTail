// File: src/app/announcement/create/page.tsx
'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

export default function CreateAnnouncementPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    species: 'dog',
    breed: '',
    gender: 'unknown',
    age_estimate: 'adult',
    color: '',
    location_found: '',
    date_found: new Date().toISOString().split('T')[0],
    health_notes: '',
    additional_notes: '',
    current_location: 'with_me',
    preferred_shelter: '',
    contact_phone: '',
    contact_email: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [shelterOptions, setShelterOptions] = useState<any[]>([]);
  
  // Fetch shelter options
  useEffect(() => {
    const fetchShelters = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select(`
              id,
              shelter_details(shelter_name, location)
            `)
            .eq('user_type', 'shelter');
            
          if (error) throw error;
          
          // Log the first item to see the structure
          if (data && data.length > 0) {
            console.log('First shelter data:', data[0]);
          }
          
          // Process data according to the actual structure
          const validShelters = data?.map(profile => {
            // If shelter_details is an array, take the first item
            const shelterDetails = Array.isArray(profile.shelter_details) 
              ? profile.shelter_details[0] 
              : profile.shelter_details;
              
            return {
              id: profile.id,
              name: shelterDetails?.shelter_name || 'Unknown Shelter',
              location: shelterDetails?.location || 'Unknown Location'
            };
          }) || [];
          
          setShelterOptions(validShelters);
        } catch (err) {
          console.error('Error fetching shelters:', err);
        }
      };
    
    fetchShelters();
  }, []);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setMessage(null);
      
      // First, create a report record
      const { data: reportData, error: reportError } = await supabase
        .from('found_animal_reports')
        .insert({
          reporter_id: user?.id || null,
          species: formData.species,
          breed: formData.breed,
          gender: formData.gender,
          age_estimate: formData.age_estimate,
          color: formData.color,
          location_found: formData.location_found,
          date_found: formData.date_found,
          health_notes: formData.health_notes,
          additional_notes: formData.additional_notes,
          current_location: formData.current_location,
          preferred_shelter_id: formData.preferred_shelter || null,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          status: 'pending', // Initial status
        })
        .select('id')
        .single();
        
      if (reportError) throw reportError;
      
      // If an image was uploaded, store it
      if (imageFile) {
        try {
          // Check if bucket exists and create if needed
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some(bucket => bucket.name === 'found_animal_images');
          
          if (!bucketExists) {
            await supabase.storage.createBucket('found_animal_images', {
              public: true
            });
          }
          
          const filePath = `found_animals/${reportData.id}/${Date.now()}_${imageFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('found_animal_images')
            .upload(filePath, imageFile);
            
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('found_animal_images')
            .getPublicUrl(filePath);
          
          // Update the report with the image URL
          await supabase
            .from('found_animal_reports')
            .update({
              image_url: urlData.publicUrl,
            })
            .eq('id', reportData.id);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
        }
      }
      
      // Create notification for the shelter if one was selected
      if (formData.preferred_shelter) {
        await supabase
          .from('notifications')
          .insert({
            user_id: formData.preferred_shelter,
            type: 'found_animal_report',
            content: `Нове оголошення про знайдену тварину - ${formData.species === 'dog' ? 'собаку' : formData.species === 'cat' ? 'кота' : 'тварину'}.`,
            reference_id: reportData.id,
            read: false
          });
      }
      
      setMessage({ 
        type: 'success', 
        text: 'Ваше оголошення успішно надіслано! Дякуємо за допомогу тварині.' 
      });
      
      // Reset form
      setFormData({
        species: 'dog',
        breed: '',
        gender: 'unknown',
        age_estimate: 'adult',
        color: '',
        location_found: '',
        date_found: new Date().toISOString().split('T')[0],
        health_notes: '',
        additional_notes: '',
        current_location: 'with_me',
        preferred_shelter: '',
        contact_phone: '',
        contact_email: '',
      });
      setImageFile(null);
      setImagePreview(null);
      
      // Redirect after delay if user is logged in
      if (user) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
      
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setMessage({ type: 'error', text: err.message || 'Не вдалося надіслати оголошення. Спробуйте ще раз.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#432907] mb-3">Оголошення про знайдену тварину</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Дякуємо, що допомагаєте безпритульній тварині. Будь ласка, надайте якомога більше інформації.
        </p>
      </div>
      
      {message && (
        <div className={`p-4 mb-8 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип тварини *
              </label>
              <select
                name="species"
                required
                value={formData.species}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="dog">Собака</option>
                <option value="cat">Кіт</option>
                <option value="other">Інше</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Порода (якщо відома)
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Наприклад: лабрадор, мікс"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Стать
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="male">Самець</option>
                <option value="female">Самка</option>
                <option value="unknown">Невідомо</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Приблизний вік
              </label>
              <select
                name="age_estimate"
                value={formData.age_estimate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="puppy_kitten">Цуценя/Кошеня</option>
                <option value="young">Молода</option>
                <option value="adult">Доросла</option>
                <option value="senior">Літня</option>
                <option value="unknown">Невідомо</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Колір/Особливі ознаки
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Наприклад: чорний з білими плямами"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата знаходження *
              </label>
              <input
                type="date"
                name="date_found"
                required
                value={formData.date_found}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Місце знаходження *
              </label>
              <input
                type="text"
                name="location_found"
                required
                value={formData.location_found}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Адреса, район або місцевість"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Поточна ситуація *
              </label>
              <select
                name="current_location"
                required
                value={formData.current_location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="with_me">Тварина тимчасово у мене</option>
                <option value="still_there">Тварина все ще знаходиться там</option>
                <option value="safe_place">Тварина в безпечному місці</option>
                <option value="other">Інше</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Стан здоров'я
              </label>
              <textarea
                name="health_notes"
                rows={2}
                value={formData.health_notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Опишіть видимі травми, хвороби або проблеми зі здоров'ям"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Додаткові примітки
              </label>
              <textarea
                name="additional_notes"
                rows={3}
                value={formData.additional_notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Будь-які інші деталі, які можуть допомогти (поведінка, ошийник, мікрочіп тощо)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Контактний телефон *
              </label>
              <input
                type="tel"
                name="contact_phone"
                required
                value={formData.contact_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="+380XXXXXXXXX"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Контактний email
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Бажаний притулок (опційно)
              </label>
              <select
                name="preferred_shelter"
                value={formData.preferred_shelter}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Оберіть притулок</option>
                {shelterOptions.map(shelter => (
                  <option key={shelter.id} value={shelter.id}>
                    {shelter.name} - {shelter.location}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Якщо ви бажаєте, щоб конкретний притулок допоміг з цією твариною, оберіть його тут.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Фото (якщо є)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Фото допоможе притулкам ідентифікувати тварину.
              </p>
              
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="h-48 object-cover rounded-md" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Надсилання...' : 'Надіслати оголошення'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}