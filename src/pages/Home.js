import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
function Home() {
  const { isAuthenticated, user, loginWithRedirect, isLoading, logout } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col justify-center items-center text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to GuardPy</h1>
        
        {isAuthenticated ? (
          <div>
            <p className="text-2xl mb-4">Welcome back, {user.name}!</p>
            <p className="text-xl mb-4">Email: {user.email}</p>
            <Link
              to="/api-key-creation"
              className="bg-white text-blue-600 font-bold py-3 px-6 rounded-full text-lg shadow-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105"
            >
              Create API Key
            </Link>

          </div>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className="bg-white text-blue-600 font-bold py-3 px-6 rounded-full text-lg shadow-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105"
          >
            Log In to Get Started
          </button>

        )}
      </div>

    </div>
  );
}

export default Home;

