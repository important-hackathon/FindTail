// src/lib/helpers.ts
import { supabase } from './supabase/client';

/**
 * Ensures all shelter profiles have corresponding shelter_details records
 * @returns Promise that resolves when all missing shelter details are created
 */
export async function fixMissingShelterDetails() {
  try {
    console.log('Checking for shelters with missing details...');
    
    // Get all shelter profiles
    const { data: shelters, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('user_type', 'shelter');
      
    if (fetchError) {
      console.error('Error fetching shelters:', fetchError);
      return;
    }
    
    if (!shelters || shelters.length === 0) {
      console.log('No shelter profiles found');
      return;
    }
    
    console.log(`Found ${shelters.length} shelter profiles`);
    
    // For each shelter, check if it has details
    for (const shelter of shelters) {
      const { data, error } = await supabase
        .from('shelter_details')
        .select('profile_id')
        .eq('profile_id', shelter.id);
        
      // If no details found, create them
      if (!data || data.length === 0) {
        console.log(`Creating missing details for shelter: ${shelter.full_name}`);
        
        const { error: insertError } = await supabase
          .from('shelter_details')
          .insert({
            profile_id: shelter.id,
            shelter_name: shelter.full_name || 'New Shelter',
            shelter_type: 'animal_shelter',
            description: 'A shelter on FindTail platform',
            location: 'Ukraine',
            website: ''
          });
          
        if (insertError) {
          console.error(`Failed to create details for ${shelter.full_name}:`, insertError);
        } else {
          console.log(`Successfully created details for ${shelter.full_name}`);
        }
      }
    }
    
    console.log('Shelter details fix completed');
  } catch (err) {
    console.error('Error in fixMissingShelterDetails:', err);
  }
}