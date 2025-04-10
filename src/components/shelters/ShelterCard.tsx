import Link from 'next/link';

interface ShelterCardProps {
  shelter: any;
}

export default function ShelterCard({ shelter }: ShelterCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {shelter.shelter_details.shelter_name}
        </h3>
        
        <div className="text-sm text-gray-600 mb-4">
          <p className="mb-1">
            <span className="font-medium">Type:</span> {shelter.shelter_details.shelter_type.replace('_', ' ')}
          </p>
          <p className="mb-1">
            <span className="font-medium">Location:</span> {shelter.shelter_details.location}
          </p>
          {shelter.shelter_details.website && (
            <p className="mb-1">
              <span className="font-medium">Website:</span>{' '}
              <a href={shelter.shelter_details.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {shelter.shelter_details.website.replace(/^https?:\/\//, '')}
              </a>
            </p>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mb-4 line-clamp-3">
          {shelter.shelter_details.description || 'No description provided.'}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {shelter.animals_count} {shelter.animals_count === 1 ? 'animal' : 'animals'} available
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
