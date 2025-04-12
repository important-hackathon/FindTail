import Link from 'next/link';

interface ShelterCardProps {
  shelter: any;
}

export default function ShelterCard({ shelter }: ShelterCardProps) {
  // Отримання безпечних значень з перевіркою на null/undefined
  const shelterName = shelter.shelter_details?.shelter_name || 'Unnamed Shelter';
  const shelterType = shelter.shelter_details?.shelter_type?.replace('_', ' ') || 'Unknown Type';
  const shelterLocation = shelter.shelter_details?.location || 'Unknown Location';
  const shelterWebsite = shelter.shelter_details?.website || '';
  const shelterDescription = shelter.shelter_details?.description || 'No description provided.';
  const animalsCount = shelter.animals_count || 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {shelterName}
        </h3>
        
        <div className="text-sm text-gray-600 mb-4">
          <p className="mb-1">
            <span className="font-medium">Type:</span> {shelterType}
          </p>
          <p className="mb-1">
            <span className="font-medium">Location:</span> {shelterLocation}
          </p>
          {shelterWebsite && (
            <p className="mb-1">
              <span className="font-medium">Website:</span>{' '}
              <a href={shelterWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {shelterWebsite.replace(/^https?:\/\//, '')}
              </a>
            </p>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mb-4 line-clamp-3">
          {shelterDescription}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {animalsCount} {animalsCount === 1 ? 'animal' : 'animals'} available
          </span>
          
          <Link 
            href={`/shelters/${shelter.id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            View Shelter
          </Link>
        </div>
      </div>
    </div>
  );
}