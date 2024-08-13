import React, { useState, useEffect, useCallback, useMemo  } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FaSync ,FaFilter } from 'react-icons/fa';
import NavBar from '../components/NavBar';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Loader from '../components/Loader/Loader';

function formatDate(dateString, includeTime = false) {
  const options = includeTime 
    ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

const TestingDashBoard = () => {
  const [leads, setLeads] = useState([]);
  const [statusNames, setStatusNames] = useState([]);
  const [leadStatus, setLeadStatus] = useState({});
  const [totalLeads, setTotalLeads] = useState(0);
  const [todayLeads, setTodayLeads] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [spinAnimation, setSpinAnimation] = useState(false);
  // const [userRole, setUserRole] = useState('');
  const [subprofiles, setSubprofiles] = useState([]);
  const [editedLeads, setEditedLeads] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  


  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to handle leads per page change
  const handleLeadsPerPageChange = (e) => {
    setLeadsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole');

  const fetchLeads = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setSpinAnimation(true);
      const [leadsResponse, statusResponse, userResponse] = await Promise.all([
        api.get('/leads'),
        api.get('/leads/current-status'),
        // api.get('/users/me')
      ]);
      const newLeads = leadsResponse.data;
      const leadStatusData = statusResponse.data;
      // const userData = userResponse.data;
  
      // setUserRole(userData.role);
  
      const sortedLeads = newLeads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
      // Combine lead data with status data
      const leadsWithStatus = sortedLeads.map(lead => {
        const statusInfo = leadStatusData.find(status => status.lead_id === lead.id);
        return {
          ...lead,
          currentStatus: statusInfo ? statusInfo.currentStatus : 'new',
          statuses: statusInfo ? statusInfo.statuses : { contacted: '', interested: '', not_interested: '' }
        };
      });
  
      setLeads(leadsWithStatus);
      setTotalLeads(leadsWithStatus.length);
  
      // Calculate today's leads
      const todayLeads = leadsWithStatus.filter(lead => {
        const leadCreatedAt = new Date(lead.created_at);
        const today = new Date();
        return (
          leadCreatedAt.getDate() === today.getDate() &&
          leadCreatedAt.getMonth() === today.getMonth() &&
          leadCreatedAt.getFullYear() === today.getFullYear()
        );
      });
      setTodayLeads(todayLeads.length);
  
      // Initialize status for each lead
      const initialLeadStatus = {};
      leadsWithStatus.forEach(lead => {
        initialLeadStatus[lead.id] = {
          status: lead.currentStatus || 'new',
          remark: lead.statusRemark || ''
        };
      });
      setLeadStatus(initialLeadStatus);
  
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Error fetching leads, Refresh again!');
      if (error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setSpinAnimation(false), 600);
    }
  }, [navigate]);

  const fetchStatusNames = useCallback(async () => {
    try {
      const response = await api.get('/leads/status-names');
      setStatusNames(response.data.statusNames);
    } catch (error) {
      console.error('Error fetching status names:', error);
      toast.error('Error fetching status names');
    }
  }, []);
  const fetchSubprofiles = useCallback(async () => {
    if (userRole === 'superadmin') {
      try {
        const response = await api.get('/auth/subprofiles');
        setSubprofiles(response.data.map(profile => ({
          ...profile,
          minInvestment: parseFloat(profile.min_investment),
          maxInvestment: parseFloat(profile.max_investment)
        })));
      } catch (error) {
        console.error('Error fetching subprofiles:', error);
        toast.error('Error fetching subprofiles');
      }
    }
  }, [userRole]);

  useEffect(() => {
    fetchLeads();
    fetchStatusNames();
  }, [fetchLeads, fetchStatusNames]);

  useEffect(() => {
    fetchSubprofiles();
  }, [fetchSubprofiles]);

  useEffect(() => {
    const interval = setInterval(fetchLeads, 15000); // Fetch leads every 10 seconds
    return () => clearInterval(interval);
  }, [fetchLeads]);

  const handleStatusChange = (leadId, newStatus) => {
    setLeads(prevLeads => {
      const updatedLeads = prevLeads.map(lead => 
        lead.id === leadId ? { ...lead, currentStatus: newStatus } : lead
      );
      setEditedLeads(prevEditedLeads => ({
        ...prevEditedLeads,
        [leadId]: true // Mark this lead as edited
      }));
      return updatedLeads;
    });
  };
  
  const handleRemarkChange = (leadId, statusType, newRemark) => {
    setLeads(prevLeads => {
      const updatedLeads = prevLeads.map(lead => 
        lead.id === leadId ? {
          ...lead,
          statuses: {
            ...lead.statuses,
            [statusType]: newRemark
          }
        } : lead
      );
      setEditedLeads(prevEditedLeads => ({
        ...prevEditedLeads,
        [leadId]: true // Mark this lead as edited
      }));
      return updatedLeads;
    });
  };

  const handleSave = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
  
    try {
      await api.put(`/leads/status/${leadId}`, {
        status: lead.currentStatus,
        remark: lead.statuses[lead.currentStatus]
      });
      toast.success('Lead status updated successfully');
      fetchLeads(); // Refresh the leads after saving

      setEditedLeads(prevEditedLeads => ({
        ...prevEditedLeads,
        [leadId]: false // Mark this lead as saved
      }));

    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Error updating lead status');
    }
  };

  // const handleComplete = async (leadId) => {
  //   try {
  //     await api.put(`/leads/complete/${leadId}`);
  //     toast.success('Lead marked as completed');
  //     fetchLeads(); // Refresh the leads after completion
  //   } catch (error) {
  //     console.error('Error completing lead:', error);
  //     toast.error('Error completing lead');
  //   }
  // };

  const handleReassign = async (leadId, newUserId) => {
    const lead = leads.find(l => l.id === leadId);
    const subprofile = subprofiles.find(s => s.id === parseInt(newUserId));
    
    if (!lead || !subprofile) {
      toast.error('Invalid lead or subprofile');
      return;
    }
  
    const leadInvestmentAmount = parseFloat(lead.investment_amount);
    
    if (isNaN(leadInvestmentAmount)) {
      toast.error('Invalid investment amount for this lead');
      return;
    }
  
    if (leadInvestmentAmount < subprofile.minInvestment || leadInvestmentAmount > subprofile.maxInvestment) {
      toast.error(`Lead investment amount (${leadInvestmentAmount}) is not within the subprofile's range (${subprofile.minInvestment} - ${subprofile.maxInvestment})`);
      return;
    }
  
    try {
      await api.put(`/leads/reassign/${leadId}`, { new_user_id: newUserId });
      toast.success('Lead reassigned successfully');
      fetchLeads(); // Refresh the leads after reassignment
    } catch (error) {
      console.error('Error reassigning lead:', error);
      toast.error('Error reassigning lead');
    }
  };

  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of the current page
    const range = [];
    const rangeWithDots = [];
  
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }
  
    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
  
    return rangeWithDots;
  };
  
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = Object.values(lead).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const createdDate = new Date(lead.created_at);
      createdDate.setHours(0, 0, 0, 0); // Set to start of day
      
      let startDate = dateRange.start ? new Date(dateRange.start) : null;
      let endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      if (startDate) startDate.setHours(0, 0, 0, 0); // Set to start of day
      if (endDate) {
        endDate.setHours(23, 59, 59, 999); // Set to end of day
      }
      
      const withinDateRange = (!startDate || createdDate >= startDate) && 
                              (!endDate || createdDate <= endDate);
      
      return matchesSearch && withinDateRange;
    });
  }, [leads, searchTerm, dateRange]);

  const clearSearchInputs = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1); // Reset to first page when clearing search
  };
  
    // Calculate pagination
    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar />
      <div className="container mx-auto w-11/12 py-8">

        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-3'>
              <h1 className="text-2xl font-semibold">Lead Dashboard</h1>
              {(searchTerm || dateRange.start || dateRange.end) && (
              <span className="text-sm border-l-4 border-yellow-500 bg-yellow-200 text-yellow-800 px-2 py-1 rounded flex items-center">
              <FaFilter className="mr-1" /> Filters Active
              </span>
              )}
              <FaSync
                onClick={fetchLeads}
                disabled={isRefreshing}
                className={`cursor-pointer ${spinAnimation ? 'spin-animation' : ''}`}
              />
            </div>

            <div className="mt-4 mb-4 flex items-center gap-5">
              <p className='px-4 py-2 bg-blue-500 text-white text-center rounded font-semibold'>Total Leads: <span className='text-xl'>{totalLeads}</span></p>
              <p className='px-4 py-2 bg-red-500 text-white text-center rounded font-semibold'>Today's Leads: <span className='text-xl'>{todayLeads}</span></p>
            </div>
        </div>
        <div className='flex justify-between items-end'>
          <div className="mt-4 mb-4 flex flex-wrap items-end gap-5">
            <div>
              <label htmlFor="searchInput" className="block text-sm font-medium text-gray-700 mb-1">Search leads</label>
              <input
                id="searchInput"
                type="text"
                placeholder="Enter keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-4 py-2 border rounded cursor-pointer"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-4 py-2 border rounded cursor-pointer"
                />
              </div>
            </div>
            
            <button
              onClick={clearSearchInputs}
              className="px-4 py-2 bg-stone-900 text-white rounded hover:bg-stone-700 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={!searchTerm && !dateRange.start && !dateRange.end}
            >
              Clear Search
            </button>
          </div>


          <div className="flex items-center justify-end gap-3 mb-2">
                <label htmlFor="leadsPerPage">Leads per page:</label>
                <select
                  id="leadsPerPage"
                  value={leadsPerPage}
                  onChange={handleLeadsPerPageChange}
                  className="px-2 py-1 border rounded"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto min-h-[70vh]">
                {currentLeads.length === 0 ? (
                  <div className="flex justify-center items-center h-[70vh]">
                    <p className="text-xl text-gray-500">No data found</p>
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-200 sticky top-0 text-sm">
                      <tr>
                        {['Id', 'Name', 'DOB', 'Whatsapp Mobile', 'Email', 'City', 'Country', 'Investment Timeline', 'Investment Duration', 'Risk Understanding', 'Previous Mutual Fund Experience', 'Investment Type', 'Investment Amount', 'Monthly Income', 'LIC Premium', 'Ideal Call Time', 'Interested Products', 'Prefer Rahul Kulkarni', 'Is NRI', 'Specific Issues', 'Created At', 'Status', 'Remark', 'Actions', ...(userRole === 'superadmin' ? ['Assigned To', 'Reassign'] : [])].map((header, index) => (
                          <th key={index} className="px-4 py-2 text-center border-b border-gray-100">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className='text-sm'>
                      {currentLeads.map((lead, index) => (
                        <tr key={lead.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.id}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.name}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center dob-column'>{formatDate(lead.date_of_birth)}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.whatsapp_mobile}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.email}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.city}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.country}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.investment_timeline}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.investment_duration}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.risk_understanding}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.previous_mutual_fund_experience}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.investment_type}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.investment_amount}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.monthly_income}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.lic_premium}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center specific-issue'>{lead.ideal_call_time}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.interested_products}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.prefer_rahul_kulkarni ? 'Yes' : 'No'}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.is_nri ? 'Yes' : 'No'}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center specific-issue'>{lead.specific_issues}</td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center dob-column'>{formatDate(lead.created_at, true)}</td>
                          <td className='px-4 py-2 border-b border-gray-100'>
                            <select
                              value={lead.currentStatus || 'new'}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className='px-2 py-1 border rounded'
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="interested">Interested</option>
                              <option value="not_interested">Not Interested</option>
                            </select>
                          </td>
                          <td className='px-4 py-2 border-b border-gray-100 '>
                            {lead.currentStatus !== 'new' && (
                              <div className="flex items-center space-x-2">
                                <textarea
                                  type="text"
                                  rows="2"
                                  value={(lead.statuses && lead.statuses[lead.currentStatus]) || ''}
                                  onChange={(e) => handleRemarkChange(lead.id, lead.currentStatus, e.target.value)}
                                  className='px-2 py-1 border rounded remark'
                                  placeholder={`${lead.currentStatus} remark`}
                                />
                              </div>
                            )}
                          </td>
                          <td className='px-4 py-2 border-b border-gray-100 text-center'>
                            <button
                              onClick={() => handleSave(lead.id)}
                              disabled={!editedLeads[lead.id]} // Disable button if no edits
                              className={`py-2 px-4 ${!editedLeads[lead.id] ? 'bg-gray-300' : 'bg-blue-500'} text-white rounded`}
                            >
                              Save
                          </button>
                            {/* {userRole === 'subprofile' && (
                              <button
                                onClick={() => handleComplete(lead.id)}
                                className='bg-green-500 text-white px-4 py-1 rounded'
                              >
                                Complete
                              </button>
                            )} */}
                          </td>
                          {userRole === 'superadmin' && (
                            <>
                              <td className='px-4 py-2 border-b border-gray-100 text-center'>
                                {lead.assigned_to_username}
                              </td>
                              <td className='px-4 py-2 border-b border-gray-100 text-center'>
                              <select
                                  onChange={(e) => handleReassign(lead.id, e.target.value)}
                                  className='px-2 py-1 border rounded cursor-pointer'
                                >
                                  <option value="">Select Subprofile</option>
                                  {subprofiles.map(subprofile => {
                                    const leadInvestmentAmount = parseFloat(lead.investment_amount);
                                    const isInRange = !isNaN(leadInvestmentAmount) && 
                                      leadInvestmentAmount >= subprofile.minInvestment && 
                                      leadInvestmentAmount <= subprofile.maxInvestment;
                                    
                                    return (
                                      <option 
                                      
                                        key={subprofile.id} 
                                        value={subprofile.id}
                                        disabled={!isInRange}
                            
                                      >
                                        {subprofile.username} ({subprofile.minInvestment} - {subprofile.maxInvestment})
                                      </option>
                                    );
                                  })}
                                </select>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          </div>

           {/* Pagination */}
          <div className="mt-4 flex justify-center items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            {getPageNumbers().map((number, index) => (
              <button
                key={index}
                onClick={() => typeof number === 'number' && paginate(number)}
                className={`px-4 py-2 border rounded ${
                  currentPage === number ? 'bg-blue-500 text-white' : ''
                } ${typeof number !== 'number' ? 'cursor-default' : ''}`}
                disabled={typeof number !== 'number'}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
            <span className="ml-2">
              Page {currentPage} of {totalPages}
            </span>
          </div>

        </div>
      </div>
  );
};

export default TestingDashBoard;
