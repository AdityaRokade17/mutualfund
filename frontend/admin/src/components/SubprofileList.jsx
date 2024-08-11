import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import NavBar from './NavBar';

const SubprofileList = () => {
  const [subprofiles, setSubprofiles] = useState([]);

  useEffect(() => {
    const fetchSubprofiles = async () => {
      try {
        const response = await api.get('/auth/subprofiles');
        setSubprofiles(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching subprofiles:', error);
      }
    };

    fetchSubprofiles();
  }, []);

  return (
    <div>
      <NavBar />
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Staff Accounts</h2>
          
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-200 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Minimum Investment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Maximum Investment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Active Leads</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subprofiles.map((subprofile) => (
                  <tr key={subprofile.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subprofile.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subprofile.min_investment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subprofile.max_investment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subprofile.active_leads_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubprofileList;