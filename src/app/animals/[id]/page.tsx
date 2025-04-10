'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AnimalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isVolunteer } = useAuth();
  
  const [animal, setAnimal] = useState<any>(null);
  const [shelter, setShelter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactForm, setContactForm] = useState({
    message: '',
    showForm: false,
  });
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  
  useEffect(() => {
    fetchAnimal();
  }, [id]);
  
  useEffect(() => {
    if (user && animal) {
      checkIfFavorite();
    }
  }, [user, animal]);
  
  const fetchAnimal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('animals')
        .select(`
          *,
          images:animal_images(*),
          shelter:profiles!inner(*, shelter_details(*))
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setAnimal(data);
      setShelter(data.shelter);
    } catch (err: any) {
      console.error('Error fetching animal:', err);
      setError('Failed to load animal details');
    } finally {
      setLoading(false);
    }
  };
  
  const checkIfFavorite = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('animal_id', animal.id)
        .eq('user_id', user?.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        console.error('Error checking favorites:', error);
        return;
      }
      
      setIsFavorite(!!data);
    } catch (err) {
      console.error('Error checking if favorite:', err);
    }
  };
  
  const toggleFavorite = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('animal_id', animal.id)
          .eq('user_id', user.id);
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            animal_id: animal.id,
            user_id: user.id,
          });
      }
      
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorites. Please try again.');
    }
  };
  
  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    try {
      setSending(true);
      
      // Insert message into the database
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: shelter.id,
          content: contactForm.message,
        });
        
      if (error) throw error;
      
      setMessageSent(true);
      setContactForm({
        message: '',
        showForm: false,
      });
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (error || !animal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error || 'Animal not found'}
        </div>
        <Link
          href="/animals"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Animals
        </Link>
      </div>
    );
  }
  
  // Format age display
  const formatAge = () => {
    if (animal.age_years === 0 && animal.age_months === 0) return 'Unknown age';
    if (animal.age_years === 0) return `${animal.age_months} month${animal.age_months !== 1 ? 's' : ''}`;
    if (animal.age_months === 0) return `${animal.age_years} year${animal.age_years !== 1 ? 's' : ''}`;
    return `${animal.age_years} year${animal.age_years !== 1 ? 's' : ''}, ${animal.age_months} month${animal.age_months !== 1 ? 's' : ''}`;
  };
  
  // Get health status info
  const getHealthStatusInfo = () => {
    switch (animal.health_status) {
      case 'healthy':
        return {
          label: 'Healthy',
          color: 'bg-green-100 text-green-800',
          description: 'This animal is in good health and ready for adoption.'
        };
      case 'needs_care':
        return {
          label: 'Needs Care',
          color: 'bg-yellow-100 text-yellow-800',
          description: 'This animal has some health issues that require attention.'
        };
      case 'urgent':
        return {
          label: 'Urgent Care Needed',
          color: 'bg-red-100 text-red-800',
          description: 'This animal requires immediate medical attention and special care.'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          description: 'No health information available.'
        };
    }
  };
  
  const healthStatus = getHealthStatusInfo();
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/animals"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Animals
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Image Gallery */}
          <div className="md:w-1/2">
            {animal.images && animal.images.length > 0 ? (
              <div className="relative h-96">
                <img 
                  src={animal.images[0].image_url} 
                  alt={animal.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}
          </div>
          
          {/* Animal Details */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900">{animal.name}</h1>
              
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full ${
                  isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                } hover:bg-opacity-80`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            </div>
            
            <div className="mt-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${healthStatus.color}`}>
                {healthStatus.label}
              </span>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Species</p>
                <p className="font-medium">
                  {animal.species === 'dog' ? '🐕 Dog' : animal.species === 'cat' ? '🐈 Cat' : '🐾 Other'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-500">Breed</p>
                <p className="font-medium">{animal.breed || 'Unknown'}</p>
              </div>
              
              <div>
                <p className="text-gray-500">Age</p>
                <p className="font-medium">{formatAge()}</p>
              </div>
              
              <div>
                <p className="text-gray-500">Gender</p>
                <p className="font-medium">
                  {animal.gender === 'male' ? 'Male' : animal.gender === 'female' ? 'Female' : 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-semibold">About {animal.name}</h2>
              <p className="mt-2 text-gray-600">
                {animal.description || 'No description provided.'}
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold">Shelter Information</h2>
              <p className="mt-2 text-gray-600">
                {shelter.shelter_details.shelter_name || 'Unknown Shelter'}
              </p>
              <p className="text-gray-600">
                Location: {shelter.shelter_details.location || 'Unknown'}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {isVolunteer && (
                  <button
                    onClick={() => setContactForm({ ...contactForm, showForm: true })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Contact Shelter
                  </button>
                )}
                
                <Link
                  href={`/shelters/${shelter.id}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  View Shelter Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Health Status Description */}
        <div className={`p-4 ${healthStatus.color}`}>
          <p>{healthStatus.description}</p>
        </div>
      </div>
      
      {/* Contact Form Modal */}
      {contactForm.showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Contact About {animal.name}</h3>
                <button
                  onClick={() => setContactForm({ ...contactForm, showForm: false })}
                  className="text-gray-400 hover:text-gray-500"
                >
                  &times;
                </button>
              </div>
              
              {messageSent ? (
                <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
                  Your message has been sent! The shelter will contact you soon.
                </div>
              ) : (
                <form onSubmit={handleContactFormSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message to Shelter
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="I'm interested in adopting this animal..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setContactForm({ ...contactForm, showForm: false })}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {sending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}