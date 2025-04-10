'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import AnimalListItem from '@/components/animals/AnimalListItem';

export default function ShelterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isVolunteer } = useAuth();
  
  const [shelter, setShelter] = useState<any>(null);
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    message: '',
    showForm: false,
  });
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  
  useEffect(() => {
    fetchShelterDetails();
  }, [id]);
  
  const fetchShelterDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get shelter details
      const { data: shelterData, error: shelterError } = await supabase
        .from('profiles')
        .select(`
          *,
          shelter_details(*)
        `)
        .eq('id', id)
        .eq('user_type', 'shelter')
        .single();
        
      if (shelterError) throw shelterError;
      
      setShelter(shelterData);
      
      // Get animals from this shelter
      const { data: animalsData, error: animalsError } = await supabase
        .from('animals')
        .select(`
          *,
          images:animal_images(*)
        `)
        .eq('shelter_id', id)
        .eq('is_adopted', false)
        .order('created_at', { ascending: false });
        
      if (animalsError) throw animalsError;
      
      setAnimals(animalsData || []);
    } catch (err: any) {
      console.error('Error fetching shelter details:', err);
      setError('Failed to load shelter details');
    } finally {
      setLoading(false);
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
  
  if (error || !shelter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error || 'Shelter not found'}
        </div>
        <Link
          href="/shelters"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Shelters
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/shelters"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Shelters
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {shelter.shelter_details.shelter_name}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Shelter Information</h2>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Type:</span> {shelter.shelter_details.shelter_type.replace('_', ' ')}</p>
                <p><span className="font-medium">Location:</span> {shelter.shelter_details.location}</p>
                <p><span className="font-medium">Contact:</span> {shelter.phone_number || 'Not provided'}</p>
                {shelter.shelter_details.website && (
                  <p>
                    <span className="font-medium">Website:</span>{' '}
                    <a href={shelter.shelter_details.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {shelter.shelter_details.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">About Us</h2>
              <p className="text-gray-600">
                {shelter.shelter_details.description || 'No description provided.'}
              </p>
              
              {isVolunteer && (
                <div className="mt-4">
                  <button
                    onClick={() => setContactForm({ ...contactForm, showForm: true })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Contact Shelter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Available Animals</h2>
      
      {animals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No animals available</h3>
          <p className="text-gray-600 mb-4">
            This shelter currently doesn't have any animals listed for adoption.
          </p>
          <p className="text-gray-600">
            Please check back later or contact the shelter for more information.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.map(animal => (
            <AnimalListItem key={animal.id} animal={animal} />
          ))}
        </div>
      )}
      
      {/* Contact Form Modal */}
      {contactForm.showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Contact {shelter.shelter_details.shelter_name}</h3>
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
                      placeholder="Your message to the shelter..."
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