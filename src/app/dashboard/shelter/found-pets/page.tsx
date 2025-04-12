'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ShelterFoundPetsPage() {
  const { user, isShelter, loading } = useAuth();
  const router = useRouter();
  const [foundAnimals, setFoundAnimals] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if not a shelter
  useEffect(() => {
    if (!loading && (!user || !isShelter)) {
      router.push('/auth/login');
    }
  }, [loading, user, isShelter, router]);

  // Fetch found animal reports for this shelter
  useEffect(() => {
    if (user) {
      fetchFoundAnimals();
    }
  }, [user]);

  const fetchFoundAnimals = async () => {
    if (!user) return;
    
    try {
      setLoadingReports(true);
      setError(null);
      
      console.log("Fetching reports for shelter ID:", user.id);
      
      // First try to get records specifically for this shelter - WITHOUT join
      let { data: preferredData, error: preferredError } = await supabase
        .from('found_animal_reports')
        .select('*')
        .eq('preferred_shelter_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (preferredError) {
        console.error("Error fetching preferred shelter reports:", preferredError);
        throw preferredError;
      }
      
      console.log("Found", preferredData?.length || 0, "reports for this shelter");
      
      // Then get records without a preferred shelter - WITHOUT join
      let { data: generalData, error: generalError } = await supabase
        .from('found_animal_reports')
        .select('*')
        .is('preferred_shelter_id', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (generalError) {
        console.error("Error fetching general reports:", generalError);
        throw generalError;
      }
      
      console.log("Found", generalData?.length || 0, "general reports");
      
      // Combine the results
      const combinedData = [
        ...(preferredData || []),
        ...(generalData || [])
      ];
      
      // If we have reporter ids, fetch their names in a separate query
      const reporterIds = combinedData
        .filter(report => report.reporter_id)
        .map(report => report.reporter_id);
      
      if (reporterIds.length > 0) {
        const { data: reportersData, error: reportersError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', reporterIds);
          
        if (!reportersError && reportersData) {
          // Define proper types for the reporters map
          interface ReporterInfo {
            id: string;
            full_name: string;
          }
          
          // Create a map of reporter ids to names
          const reportersMap: Record<string, ReporterInfo> = {};
          
          // Fill the map with reporter data
          reportersData.forEach((reporter: ReporterInfo) => {
            reportersMap[reporter.id] = reporter;
          });
          
          // Add reporter info to each report
          combinedData.forEach(report => {
            if (report.reporter_id && reportersMap[report.reporter_id]) {
              report.reporter = reportersMap[report.reporter_id];
            } else {
              report.reporter = { full_name: 'Анонімний користувач' };
            }
          });
        }
      }
      
      console.log("Total found reports:", combinedData.length);
      setFoundAnimals(combinedData);
    } catch (err: any) {
      console.error('Error fetching found animals:', err);
      let errorMessage = 'Помилка завантаження даних. Спробуйте ще раз.';
      
      if (err.message) {
        errorMessage += ` (${err.message})`;
      } else if (err.code) {
        errorMessage += ` (Код: ${err.code})`;
      }
      
      setError(errorMessage);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleAddToShelter = async (reportId: string) => {
    if (!user) return;
    
    try {
      setProcessingId(reportId);
      setError(null);
      setSuccessMessage(null);
      
      // Find the report details
      const report = foundAnimals.find(animal => animal.id === reportId);
      if (!report) {
        throw new Error('Повідомлення не знайдено');
      }
      
      console.log("Processing report:", report);
      
      // 1. Add animal to shelter's animals list
      const { data: animalData, error: animalError } = await supabase
        .from('animals')
        .insert({
          name: report.breed || getSpeciesLabel(report.species), // Use breed as name or species if no breed
          species: report.species,
          breed: report.breed,
          gender: report.gender,
          age_years: report.age_estimate === 'puppy_kitten' || report.age_estimate === 'young' ? 0 : 
                    report.age_estimate === 'adult' ? 2 : 
                    report.age_estimate === 'senior' ? 5 : 1,
          age_months: report.age_estimate === 'puppy_kitten' ? 3 : 0,
          description: `${report.additional_notes || ''} ${report.health_notes ? 'Стан здоров\'я: ' + report.health_notes : ''}`.trim(),
          health_status: report.health_notes ? 'needs_care' : 'healthy',
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
      if (report.image_url) {
        try {
          const { error: imageError } = await supabase
            .from('animal_images')
            .insert({
              animal_id: animalData.id,
              image_url: report.image_url,
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
        .eq('id', reportId);
        
      if (updateError) {
        console.error("Error updating report status:", updateError);
        throw updateError;
      }
      
      console.log("Updated report status to processed");
      
      // 4. Send notification to the reporter if there is one
      if (report.reporter_id) {
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: report.reporter_id,
              type: 'found_animal_processed',
              content: `Ваше повідомлення про знайдену тварину прийнято притулком.`,
              reference_id: reportId,
              read: false
            });
            
          console.log("Notification sent to reporter:", report.reporter_id);
        } catch (notifyErr) {
          console.error("Error sending notification:", notifyErr);
          // Continue anyway as this isn't critical
        }
      }
      
      // Success! Update the UI
      setSuccessMessage('Тварину успішно додано до вашого притулку!');
      setFoundAnimals(foundAnimals.filter(animal => animal.id !== reportId));
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
    } catch (err: any) {
      console.error('Error processing found animal:', err);
      setError(err.message || 'Помилка при додаванні тварини. Спробуйте ще раз.');
    } finally {
      setProcessingId(null);
    }
  };

  // Helper functions
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
  
  if (loading || loadingReports) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Завантаження...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Знайдені тварини</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {foundAnimals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Немає доступних повідомлень про знайдених тварин
          </h2>
          <p className="text-gray-600 mb-6">
            Наразі немає повідомлень про знайдених тварин для вашого притулку.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foundAnimals.map((animal) => (
            <div key={animal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {animal.image_url ? (
                <div className="h-48 relative">
                  <img 
                    src={animal.image_url} 
                    alt={`${getSpeciesLabel(animal.species)}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Немає фото</span>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex justify-between">
                  <div>
                    <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {getSpeciesLabel(animal.species)}
                    </span>
                    {animal.breed && (
                      <span className="ml-2 text-sm text-gray-600">
                        {animal.breed}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(animal.date_found)}
                  </span>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Вік:</span> {getAgeLabel(animal.age_estimate)}
                  </div>
                  <div>
                    <span className="text-gray-500">Колір:</span> {animal.color || 'Не вказано'}
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className="text-gray-500">Знайдено:</span> {animal.location_found}
                </div>
                
                {animal.additional_notes && (
                  <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {animal.additional_notes}
                  </div>
                )}
                
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {animal.reporter?.full_name || 'Анонімний користувач'}
                    </span>
                    <Link 
                      href={`/dashboard/shelter/found-pets/${animal.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Детальніше
                    </Link>
                  </div>
                  
                  <button
                    onClick={() => handleAddToShelter(animal.id)}
                    disabled={processingId === animal.id}
                    className="w-full px-4 py-2 bg-[#A9BFF2] text-white rounded-md hover:bg-[#93a9d5] disabled:opacity-50 text-sm font-medium"
                  >
                    {processingId === animal.id 
                      ? 'Обробка...' 
                      : 'Додати до списку тварин'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}