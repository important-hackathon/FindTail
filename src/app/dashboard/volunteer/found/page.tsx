'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

export default function ReportFoundPetPage() {
  const { user, isVolunteer, loading } = useAuth();
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
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [shelterOptions, setShelterOptions] = useState<any[]>([]);
  
  // Redirect if not a volunteer
  useEffect(() => {
    if (!loading && (!user || !isVolunteer)) {
      router.push('/auth/login');
    }
  }, [loading, user, isVolunteer, router]);
  
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
        
        // Filter to only include profiles with shelter details
        const validShelters = data
          ?.filter(profile => profile.shelter_details)
          .map(profile => ({
            id: profile.id,
            name: profile.shelter_details.shelter_name,
            location: profile.shelter_details.location
          })) || [];
          
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
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setMessage(null);
      
      // First, create a report record
      const { data: reportData, error: reportError } = await supabase
        .from('found_animal_reports')
        .insert({
          reporter_id: user.id,
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
          status: 'pending', // Initial status
        })
        .select('id')
        .single();
        
      if (reportError) throw reportError;
      
      // If an image was uploaded, store it
      if (imageFile) {
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
      }
      
      // Create notification for the shelter if one was selected
      if (formData.preferred_shelter) {
        await supabase
          .from('notifications')
          .insert({
            user_id: formData.preferred_shelter,
            type: 'found_animal_report',
            content: `A new found animal report has been submitted by a volunteer.`,
            reference_id: reportData.id,
            read: false
          });
      }
      
      setMessage({ 
        type: 'success', 
        text: 'Your report has been submitted successfully! Thank you for helping this animal.' 
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
      });
      setImageFile(null);
      setImagePreview(null);
      
      // Redirect after delay
      setTimeout(() => {
        router.push('/dashboard/volunteer');
      }, 3000);
      
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to submit report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Report a Found Animal</h1>
      <p className="text-gray-600 mb-6">
        Thank you for helping a homeless animal. Please provide as much information as possible.
      </p>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animal Type *
              </label>
              <select
                name="species"
                required
                value={formData.species}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed/Type (if known)
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Labrador, Mixed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Estimate
              </label>
              <select
                name="age_estimate"
                value={formData.age_estimate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="puppy_kitten">Puppy/Kitten</option>
                <option value="young">Young</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color/Markings
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Black with white spots"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Found *
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
                Location Found *
              </label>
              <input
                type="text"
                name="location_found"
                required
                value={formData.location_found}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Street address, neighborhood, or area"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Situation *
              </label>
              <select
                name="current_location"
                required
                value={formData.current_location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="with_me">Animal is with me temporarily</option>
                <option value="still_there">Animal is still at the location</option>
                <option value="safe_place">Animal is in a safe place</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Condition Notes
              </label>
              <textarea
                name="health_notes"
                rows={2}
                value={formData.health_notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe any visible injuries, illness, or health concerns"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                name="additional_notes"
                rows={3}
                value={formData.additional_notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any other details that might help (behavior, collar, microchip, etc.)"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Shelter (optional)
              </label>
              <select
                name="preferred_shelter"
                value={formData.preferred_shelter}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a shelter</option>
                {shelterOptions.map(shelter => (
                  <option key={shelter.id} value={shelter.id}>
                    {shelter.name} - {shelter.location}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                If you prefer a specific shelter to help with this animal, select it here.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo (if available)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                A photo will help shelters identify the animal.
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
