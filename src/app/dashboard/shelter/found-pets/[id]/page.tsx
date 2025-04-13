'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function FoundPetDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isShelter, loading } = useAuth();
  
  const [animal, setAnimal] = useState<any>(null);
  const [reporter, setReporter] = useState<any>(null);
  const [preferredShelter, setPreferredShelter] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Redirect if not authorized
  useEffect(() => {
    if (!loading && (!user || !isShelter)) {
      router.push('/auth/login');
    }
  }, [loading, user, isShelter, router]);
  
  useEffect(() => {
    if (user && id) {
      fetchAnimalDetails();
    }
  }, [user, id]);
  
  const fetchAnimalDetails = async () => {
    if (!id) return;
    
    try {
      setDataLoading(true);
      setError(null);
      
      console.log("Fetching details for report ID:", id);
      
      // Get the basic report data without joins
      const { data, error } = await supabase
        .from('found_animal_reports')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error fetching report:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Report not found');
      }
      
      console.log("Found report:", data);
      
      // Check if this shelter is authorized to see this report
      if (data.preferred_shelter_id && data.preferred_shelter_id !== user?.id) {
        setError('У вас немає доступу до цього повідомлення');
        setAnimal(null);
        return;
      }
      
      // Fetch reporter info if available
      if (data.reporter_id) {
        const { data: reporterData, error: reporterError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.reporter_id)
          .single();
          
        if (!reporterError && reporterData) {
          setReporter(reporterData);
          console.log("Reporter data:", reporterData);
        }
      }
      
      // Fetch preferred shelter info if available
      if (data.preferred_shelter_id) {
        const { data: shelterData, error: shelterError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.preferred_shelter_id)
          .single();
          
        if (!shelterError && shelterData) {
          // Get shelter details
          const { data: detailsData } = await supabase
            .from('shelter_details')
            .select('*')
            .eq('profile_id', shelterData.id)
            .single();
            
          setPreferredShelter({
            ...shelterData,
            shelter_details: detailsData || {}
          });
          console.log("Preferred shelter data:", shelterData);
        }
      }
      
      // Set the animal data
      setAnimal(data);
    } catch (err: any) {
      console.error('Error fetching animal details:', err);
      let errorMessage = 'Помилка завантаження даних. Спробуйте ще раз.';
      
      if (err.message) {
        errorMessage += ` (${err.message})`;
      } else if (err.code) {
        errorMessage += ` (Код: ${err.code})`;
      }
      
      setError(errorMessage);
    } finally {
      setDataLoading(false);
    }
  };
  
  const handleAddToShelter = async () => {
    if (!user || !animal) return;
    
    try {
      setProcessingAction(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log("Processing animal:", animal);
      
      // 1. Add animal to shelter's animals list
      const { data: animalData, error: animalError } = await supabase
        .from('animals')
        .insert({
          name: animal.breed || getSpeciesLabel(animal.species), // Use breed as name or species if no breed
          species: animal.species,
          breed: animal.breed,
          gender: animal.gender,
          age_years: animal.age_estimate === 'puppy_kitten' || animal.age_estimate === 'young' ? 0 : 
                    animal.age_estimate === 'adult' ? 2 : 
                    animal.age_estimate === 'senior' ? 5 : 1,
          age_months: animal.age_estimate === 'puppy_kitten' ? 3 : 0,
          description: `${animal.additional_notes || ''} ${animal.health_notes ? 'Стан здоров\'я: ' + animal.health_notes : ''}`.trim(),
          health_status: animal.health_notes ? 'needs_care' : 'healthy',
          shelter_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_adopted: false
        })
        .select('id')
        .single();
        
      if (animalError) {
        console.error("Error creating animal:", animalError);
        throw animalError;
      }
      
      console.log("Created animal with ID:", animalData?.id);
      
      // 2. If there's an image, copy it to animal_images
      if (animal.image_url) {
        try {
          const { error: imageError } = await supabase
            .from('animal_images')
            .insert({
              animal_id: animalData.id,
              image_url: animal.image_url,
              is_primary: true,
              created_at: new Date().toISOString()
            });
            
          if (imageError) {
            console.error('Error copying image:', imageError);
            // Continue anyway as this isn't critical
          } else {
            console.log("Image copied to animal_images");
          }
        } catch (imgErr) {
          console.error("Exception copying image:", imgErr);
        }
      }
      
      // 3. Update the report status to 'processed'
      const { error: updateError } = await supabase
        .from('found_animal_reports')
        .update({
          status: 'processed',
          processed_by: user.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', animal.id);
        
      if (updateError) {
        console.error("Error updating report status:", updateError);
        throw updateError;
      }
      
      console.log("Updated report status to processed");
      
      // 4. Send notification to the reporter if there is one
      if (animal.reporter_id) {
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: animal.reporter_id,
              type: 'found_animal_processed',
              content: `Ваше повідомлення про знайдену тварину прийнято притулком.`,
              reference_id: animal.id,
              read: false
            });
            
          console.log("Notification sent to reporter:", animal.reporter_id);
        } catch (notifyErr) {
          console.error("Error sending notification:", notifyErr);
          // Continue anyway as this isn't critical
        }
      }
      
      // Success! Update the UI
      setSuccessMessage('Тварину успішно додано до вашого притулку!');
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/dashboard/shelter/animals');
      }, 3000);
      
    } catch (err: any) {
      console.error('Error processing found animal:', err);
      setError(err.message || 'Помилка при додаванні тварини. Спробуйте ще раз.');
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Helper functions - same as in the previous component
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('uk-UA', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };
  
  const getSpeciesLabel = (species: string) => {
    switch(species) {
      case 'dog': return 'Собака';
      case 'cat': return 'Кіт';
      default: return 'Інше';
    }
  };
  
  const getAgeLabel = (age: string) => {
    switch(age) {
      case 'puppy_kitten': return 'Цуценя/Кошеня';
      case 'young': return 'Молода';
      case 'adult': return 'Доросла';
      case 'senior': return 'Літня';
      default: return 'Невідомо';
    }
  };
  
  const getGenderLabel = (gender: string) => {
    switch(gender) {
      case 'male': return 'Самець';
      case 'female': return 'Самка';
      default: return 'Невідомо';
    }
  };
  
  const getLocationLabel = (location: string) => {
    switch(location) {
      case 'with_me': return 'Тварина тимчасово у мене';
      case 'still_there': return 'Тварина все ще на місці';
      case 'safe_place': return 'Тварина в безпечному місці';
      default: return 'Інше';
    }
  };
  
  if (loading || dataLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Завантаження...</p>
        </div>
      </div>
    );
  }
  
  if (error || !animal) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error || 'Тварину не знайдено'}
        </div>
        <Link
          href="/dashboard/shelter/found-pets"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Повернутись до списку
        </Link>
      </div>
    );
  }
  
  // If the animal is already processed
  if (animal.status === 'processed') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md mb-6">
          Цю тварину вже було додано до притулку.
        </div>
        <Link
          href="/dashboard/shelter/found-pets"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Повернутись до списку
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/shelter/found-pets"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Повернутись до списку
        </Link>
      </div>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Image */}
          <div className="md:w-1/3">
            {animal.image_url ? (
              <div className="relative h-full">
                <img 
                  src={animal.image_url} 
                  alt={getSpeciesLabel(animal.species)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Handle image load error - show fallback
                    console.log("Image failed to load:", animal.image_url);
                    e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
                  }}
                />
                {/* <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  {animal.image_url}
                </div> */}
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Немає фото</span>
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-gray-900">
                {getSpeciesLabel(animal.species)} {animal.breed ? `(${animal.breed})` : ''}
              </h1>
              <span className="text-sm text-gray-500">
                {formatDate(animal.date_found)}
              </span>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500">Вік:</span> {getAgeLabel(animal.age_estimate)}
              </div>
              <div>
                <span className="text-gray-500">Стать:</span> {getGenderLabel(animal.gender)}
              </div>
              <div>
                <span className="text-gray-500">Колір:</span> {animal.color || 'Не вказано'}
              </div>
              <div>
                <span className="text-gray-500">Поточне місцезнаходження:</span> {getLocationLabel(animal.current_location)}
              </div>
            </div>
            
            <div className="mt-4">
              <span className="text-gray-500">Місце знаходження:</span> {animal.location_found}
            </div>
            
            {animal.health_notes && (
              <div className="mt-4">
                <h2 className="font-medium text-gray-900">Стан здоров'я:</h2>
                <p className="text-gray-600 mt-1">{animal.health_notes}</p>
              </div>
            )}
            
            {animal.additional_notes && (
              <div className="mt-4">
                <h2 className="font-medium text-gray-900">Додаткові примітки:</h2>
                <p className="text-gray-600 mt-1">{animal.additional_notes}</p>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="font-medium text-gray-900">Контактна інформація:</h2>
              <div className="mt-2">
                <p className="text-gray-600">
                  <span className="font-medium">Повідомив:</span> {reporter?.full_name || 'Анонімний користувач'}
                </p>
                
                {reporter?.phone_number && (
                  <p className="text-gray-600 mt-1">
                    <span className="font-medium">Телефон:</span> {reporter.phone_number}
                  </p>
                )}
                
                {animal.contact_phone && (
                  <p className="text-gray-600 mt-1">
                    <span className="font-medium">Контактний телефон:</span> {animal.contact_phone}
                  </p>
                )}
                
                {animal.contact_email && (
                  <p className="text-gray-600 mt-1">
                    <span className="font-medium">Контактний email:</span> {animal.contact_email}
                  </p>
                )}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleAddToShelter}
                  disabled={processingAction}
                  className="px-4 py-2 bg-[#A9BFF2] text-white rounded-md hover:bg-[#93a9d5] disabled:opacity-50"
                >
                  {processingAction 
                    ? 'Обробка...' 
                    : 'Додати до списку тварин притулку'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}