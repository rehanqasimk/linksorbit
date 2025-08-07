'use client';

import Link from 'next/link';

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 text-green-500">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Registration Successful!</h2>
        <p className="text-gray-300 mb-6">
          Thank you for registering. Your account is currently pending verification from our admin team. 
          We will review your information and notify you via email once your account is approved.
        </p>
        <Link 
          href="/auth/login" 
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-md transition-colors"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}
