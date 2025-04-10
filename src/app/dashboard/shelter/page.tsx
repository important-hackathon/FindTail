'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function ShelterDashboard() {
  const { profile, signOut } = useAuth();
  const shelterDetails = profile?.shelter_details;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shelter Dashboard</h1>
        <button 
          onClick={signOut}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {shelterDetails?.shelter_name}</h2>
        <p className="text-gray-600">Type: {shelterDetails?.shelter_type?.replace('_', ' ')}</p>
        <p className="text-gray-600">Location: {shelterDetails?.location}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Manage Animals</h3>
          <p className="text-gray-600 mb-4">Add or update animal listings</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Manage Animals
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Adoption Requests</h3>
          <p className="text-gray-600 mb-4">Review incoming adoption requests</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            View Requests
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Shelter Profile</h3>
          <p className="text-gray-600 mb-4">Update your shelter information</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
