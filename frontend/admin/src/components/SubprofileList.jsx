import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import NavBar from './NavBar';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SubprofileList = () => {
  const [subprofiles, setSubprofiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubprofile, setEditingSubprofile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubprofiles();
  }, []);

  const fetchSubprofiles = async () => {
    try {
      const response = await api.get('/auth/subprofiles');
      setSubprofiles(response.data);
    } catch (error) {
      console.error('Error fetching Staff:', error);
    }
  };

  const handleEdit = (subprofile) => {
    setEditingSubprofile(subprofile);
    setFormData({
      username: subprofile.username,
      password: '',
      confirmPassword: ''
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await api.put(`/auth/subprofile/${editingSubprofile.id}`, {
        username: formData.username,
        password: formData.password
      });
      toast.success(`${formData.username} updated successfully!`);
      setIsModalOpen(false);
      fetchSubprofiles();
    } catch (error) {
      console.error('Error updating subprofile:', error);
      toast.error(`Failed to update staff ${formData.username}.`);
      setError('Failed to update Staff');
    }
  };

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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subprofiles.map((subprofile) => (
                  <tr key={subprofile.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subprofile.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subprofile.min_investment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subprofile.max_investment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subprofile.active_leads_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleEdit(subprofile)}
                        className="text-white hover:bg-green-700 bg-green-600 rounded py-1 px-2"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit Staff</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              {error && <p className="text-red-500 text-xs my-2 italic">{error}</p>}
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubprofileList;
