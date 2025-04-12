'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnimalFormProps {
  editMode?: boolean;
  animalData?: any;
}

export default function AnimalForm({ editMode = false, animalData }: AnimalFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: animalData?.name || '',
    species: animalData?.species || 'dog',
    breed: animalData?.breed || '',
    age_years: animalData?.age_years || 0,
    age_months: animalData?.age_months || 0,
    gender: animalData?.gender || 'unknown',
    health_status: animalData?.health_status || 'healthy',
    description: animalData?.description || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    animalData?.images?.[0]?.image_url || null
  );
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);

  // Check if the animal-images bucket exists on component mount
  useEffect(() => {
    const checkBucket = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) {
          console.error('Error checking buckets:', error);
          setBucketExists(false);
          return;
        }
        
        const exists = buckets.some(bucket => bucket.name === 'animal-images');
        setBucketExists(exists);
        
        if (!exists) {
          console.warn('animal-images bucket does not exist in Supabase storage');
        }
      } catch (err) {
        console.error('Error checking buckets:', err);
        setBucketExists(false);
      }
    };
    
    checkBucket();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Файл зображення занадто великий. Максимальний розмір: 5MB.' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Будь ласка, виберіть файл зображення (JPEG, PNG, тощо).' });
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous error messages
      setMessage(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!user) throw new Error('Ви повинні бути авторизовані');

      // Step 1: Add or update animal record
      let animalId: string;
      
      if (editMode && animalData?.id) {
        // Update existing animal
        const { error } = await supabase
          .from('animals')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', animalData.id);
          
        if (error) throw error;
        animalId = animalData.id;
      } else {
        // Create new animal
        const { data, error } = await supabase
          .from('animals')
          .insert({
            ...formData,
            shelter_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();
          
        if (error) throw error;
        animalId = data.id;
      }

      // Step 2: Handle image upload if there's a new image
      let imageUrl = null;
      if (imageFile && bucketExists) {
        try {
          // Create a safe filename
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${animalId}_${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;
          
          // Upload image to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('animal-images')
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error(`Помилка завантаження зображення: ${uploadError.message}`);
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('animal-images')
            .getPublicUrl(filePath);
            
          imageUrl = urlData.publicUrl;
          
          // Update animal with direct image URL
          await supabase
            .from('animals')
            .update({
              image_url: imageUrl
            })
            .eq('id', animalId);
          
          // Add image record to database
          const { error: imageDbError } = await supabase
            .from('animal_images')
            .insert({
              animal_id: animalId,
              image_url: imageUrl,
              is_primary: true
            });
            
          if (imageDbError) {
            console.error('Error saving image record to database:', imageDbError);
            throw new Error(`Помилка збереження даних зображення в базі даних: ${imageDbError.message}`);
          }
        } catch (uploadError: any) {
          console.error('Error handling image upload:', uploadError);
          // Don't throw the error, continue with animal creation
          setMessage({
            type: 'warning',
            text: `${editMode ? 'Тварину оновлено' : 'Тварину додано'} успішно, але виникла проблема із завантаженням зображення.`
          });
          
          // Set a delay for message viewing before redirect
          setTimeout(() => {
            router.push('/dashboard/shelter/animals');
            router.refresh();
          }, 2500);
          
          setLoading(false);
          return;
        }
      } else if (imageFile && !bucketExists) {
        setMessage({
          type: 'warning',
          text: `${editMode ? 'Тварину оновлено' : 'Тварину додано'} успішно, але завантаження зображення недоступне. Bucket "animal-images" не знайдено у Supabase.`
        });
        
        // Set a delay for message viewing before redirect
        setTimeout(() => {
          router.push('/dashboard/shelter/animals');
          router.refresh();
        }, 2500);
        
        setLoading(false);
        return;
      }

      setMessage({ 
        type: 'success', 
        text: editMode ? 'Тварину оновлено успішно!' : 'Тварину додано успішно!' 
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/shelter/animals');
        router.refresh();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: error.message || 'Сталася помилка' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{editMode ? 'Редагувати тварину' : 'Додати нову тварину'}</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 
          message.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 
          'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      {bucketExists === false && (
        <div className="p-4 mb-6 rounded-md bg-yellow-100 text-yellow-700">
          <strong>Попередження:</strong> Bucket "animal-images" не знайдено у Supabase storage. 
          Завантаження зображень не працюватиме. Будь ласка, зверніться до адміністратора для створення bucket.
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ім'я *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Вид *
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
              Порода
            </label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Вік (Роки)
              </label>
              <input
                type="number"
                name="age_years"
                min="0"
                max="30"
                value={formData.age_years}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Вік (Місяці)
              </label>
              <input
                type="number"
                name="age_months"
                min="0"
                max="11"
                value={formData.age_months}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
              Стан здоров'я
            </label>
            <select
              name="health_status"
              value={formData.health_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="healthy">Здоровий</option>
              <option value="needs_care">Потребує догляду</option>
              <option value="urgent">Потрібна термінова допомога</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Опис
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Фото
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={bucketExists === false}
          />
          
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="h-48 object-cover rounded-md" />
            </div>
          )}
          
          {bucketExists === false && (
            <p className="mt-2 text-sm text-red-500">
              Завантаження зображень вимкнено. Bucket "animal-images" не знайдено у Supabase.
            </p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Збереження...' : editMode ? 'Оновити тварину' : 'Додати тварину'}
          </button>
        </div>
      </form>
    </div>
  );
}