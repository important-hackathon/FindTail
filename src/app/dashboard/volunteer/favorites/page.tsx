'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import AnimalListItem from '@/components/animals/AnimalListItem';
import Link from 'next/link';

export default function FavoritesPage() {
  const { user, isVolunteer, loading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (!isVolunteer) {
        router.push('/dashboard');
      } else {
        fetchFavorites();
      }
    }
  }, [user, loading, isVolunteer, router]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          animal:animals(
            *,
            images:animal_images(*),
            shelter:profiles(*)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out any favorites where the animal might have been deleted
      const validFavorites = data?.filter(item => item.animal) || [];
      setFavorites(validFavorites);
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load your favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      // Update the local state
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No favorites yet</h2>
          <p className="text-gray-600 mb-6">
            Start browsing animals and add them to your favorites.
          </p>
          <Link 
            href="/animals"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Animals
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(favorite => (
            <div key={favorite.id} className="relative">
              <AnimalListItem animal={favorite.animal} />
              <button
                onClick={() => handleRemoveFavorite(favorite.id)}
                className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md text-red-600 hover:bg-red-50"
                aria-label="Remove from favorites"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
