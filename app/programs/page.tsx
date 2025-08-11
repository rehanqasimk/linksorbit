'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Program {
  id: string;
  logo: string;
  name: string;
  country: string;
  category: string;
  commission: string;
  affiliateAccess: string;
  status: 'LIVE' | 'PENDING' | 'REJECTED' | 'CLOSED';
}

export default function Programs() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'ALL' | 'CPC' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'CLOSED'>('ALL');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Mock data - you would fetch this from an API
  const mockPrograms: Program[] = [
    {
      id: '305843',
      logo: '/logo-placeholder.svg',
      name: 'Green Box NL',
      country: 'Netherlands',
      category: 'E-commerce',
      commission: '70.90%',
      affiliateAccess: 'No Relationship',
      status: 'LIVE',
    },
    {
      id: '305842',
      logo: '/logo-placeholder.svg',
      name: 'Omni-Tech',
      country: 'United States',
      category: 'E-commerce',
      commission: '70.90%',
      affiliateAccess: 'No Relationship',
      status: 'LIVE',
    },
    {
      id: '305841',
      logo: '/logo-placeholder.svg',
      name: 'Lone Woods',
      country: 'United States',
      category: 'E-commerce',
      commission: '70.00%',
      affiliateAccess: 'No Relationship',
      status: 'LIVE',
    },
    // Add more mock data as needed
  ];

  const handleSearch = () => {
    // Implement search logic here
    console.log('Searching...');
  };

  const handleExport = () => {
    // Implement export logic here
    console.log('Exporting...');
  };

  const handleSort = (column: string) => {
    // Implement sorting logic here
    console.log(`Sorting by ${column}`);
  };

  const totalPages = 12; // Example value

  // Filter programs based on active tab
  const filteredPrograms = mockPrograms.filter(program => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'CPC') return true; // Add logic for CPC programs
    if (activeTab === 'APPROVED') return program.status === 'LIVE';
    if (activeTab === 'PENDING') return program.status === 'PENDING';
    if (activeTab === 'REJECTED') return program.status === 'REJECTED';
    if (activeTab === 'CLOSED') return program.status === 'CLOSED';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Programs</h1>
          <nav className="flex space-x-6">
            <Link href="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>
            <Link href="/programs" className="text-white hover:text-gray-300 font-bold">Programs</Link>
            <Link href="/reports" className="text-white hover:text-gray-300">Reports</Link>
            <Link href="/payments" className="text-white hover:text-gray-300">Payments</Link>
          </nav>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <nav className="flex -mb-px">
            <button 
              onClick={() => setActiveTab('CPC')} 
              className={`mr-8 py-4 text-sm font-medium ${
                activeTab === 'CPC' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              CPC Programs
            </button>
            <button 
              onClick={() => setActiveTab('ALL')} 
              className={`mr-8 py-4 text-sm font-medium ${
                activeTab === 'ALL' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Programs (All)
            </button>
            <button 
              onClick={() => setActiveTab('APPROVED')} 
              className={`mr-8 py-4 text-sm font-medium ${
                activeTab === 'APPROVED' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Approved
            </button>
            <button 
              onClick={() => setActiveTab('PENDING')} 
              className={`mr-8 py-4 text-sm font-medium ${
                activeTab === 'PENDING' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Pending
            </button>
            <button 
              onClick={() => setActiveTab('REJECTED')} 
              className={`mr-8 py-4 text-sm font-medium ${
                activeTab === 'REJECTED' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Rejected
            </button>
            <button 
              onClick={() => setActiveTab('CLOSED')} 
              className={`mr-8 py-4 text-sm font-medium ${
                activeTab === 'CLOSED' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Closed
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Select Program</label>
            <select 
              value={selectedProgram} 
              onChange={(e) => setSelectedProgram(e.target.value)} 
              className="w-full bg-gray-800 border border-gray-700 rounded py-2 px-3 text-white"
            >
              <option value="">Select Program</option>
              {/* Add program options */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Select Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)} 
              className="w-full bg-gray-800 border border-gray-700 rounded py-2 px-3 text-white"
            >
              <option value="">Select Category</option>
              <option value="e-commerce">E-commerce</option>
              {/* Add more categories */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Select Country</label>
            <select 
              value={selectedCountry} 
              onChange={(e) => setSelectedCountry(e.target.value)} 
              className="w-full bg-gray-800 border border-gray-700 rounded py-2 px-3 text-white"
            >
              <option value="">Select Country</option>
              <option value="united-states">United States</option>
              <option value="netherlands">Netherlands</option>
              {/* Add more countries */}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div>
          <button 
            onClick={handleSearch} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
          >
            SEARCH
          </button>
        </div>

        {/* Programs Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <button 
              onClick={handleExport} 
              className="flex items-center text-indigo-400 hover:text-indigo-300"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Export
            </button>
            <input
              type="text"
              placeholder="Keyword Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('id')}>
                    ID
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                    Program Name
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('country')}>
                    Country
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('category')}>
                    Category
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('commission')}>
                    Comm. (USD)
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Affiliate Access
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                    Status
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredPrograms.map((program) => (
                  <tr key={program.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {program.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
                        {program.logo ? (
                          <Image src={program.logo} alt={program.name} width={40} height={40} className="rounded-full" />
                        ) : (
                          program.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {program.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {program.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {program.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {program.commission}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {program.affiliateAccess}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        program.status === 'LIVE' ? 'bg-green-100 text-green-800' : 
                        program.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        program.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {program.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-5 py-5 bg-gray-800 border-t border-gray-700 flex flex-wrap items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600">
                Previous
              </button>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="ml-3 px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {[...Array(Math.min(7, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === pageNum ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'
                        } text-sm font-medium`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 7 && (
                    <>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400">
                        ...
                      </span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === totalPages ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'
                        } text-sm font-medium`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
