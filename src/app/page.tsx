import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Help Save Homeless Animals
            </h1>
            <p className="mt-6 text-xl max-w-2xl mx-auto">
              Connect with animal shelters and make a difference in the lives of animals left behind during the crisis.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link 
                href="/auth/register" 
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Join Now
              </Link>
              <Link 
                href="/auth/login" 
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  1
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Register as a Volunteer or Shelter</h3>
                <p className="mt-2 text-base text-gray-500">
                  Create your account and join our growing community dedicated to helping animals.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  2
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Connect and Coordinate</h3>
                <p className="mt-2 text-base text-gray-500">
                  Browse available animals or list animals in need of homes.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  3
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Make a Difference</h3>
                <p className="mt-2 text-base text-gray-500">
                  Adopt, donate, or volunteer to help animals in crisis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
