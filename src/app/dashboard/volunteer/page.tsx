'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function VolunteerDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
        <button 
          onClick={signOut}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {profile?.full_name}</h2>
        <p>Start browsing available animals or connect with shelters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Find Animals</h3>
          <p className="text-gray-600 mb-4">Browse animals in need of adoption</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Browse Animals
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Saved Animals</h3>
          <p className="text-gray-600 mb-4">View animals you've saved</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            View Saved
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Report a Found Animal</h3>
          <p className="text-gray-600 mb-4">Report an animal you've found</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Report Animal
          </button>
        </div>
      </div>
    </div>
  );
}
