import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FaSync } from 'react-icons/fa';
import NavBar from './NavBar';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function formatDate(dateString, includeTime = false) {
  const options = includeTime 
    ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [statusNames, setStatusNames] = useState([]);
  const [leadStatus, setLeadStatus] = useState({});
  const [totalLeads, setTotalLeads] = useState(0);
  const [todayLeads, setTodayLeads] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [spinAnimation, setSpinAnimation] = useState(false);

  const navigate = useNavigate();

  const fetchLeads = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setSpinAnimation(true);
      const [leadsResponse, statusResponse] = await Promise.all([
        api.get('/leads'),
        api.get('/leads/current-status')
      ]);
      const newLeads = leadsResponse.data;
      const leadStatusData = statusResponse.data;
  
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

  useEffect(() => {
    fetchLeads();
    fetchStatusNames();
  }, [fetchLeads, fetchStatusNames]);

  useEffect(() => {
    const interval = setInterval(fetchLeads, 10000); // Fetch leads every 10 seconds
    return () => clearInterval(interval);
  }, [fetchLeads]);

  const handleStatusChange = (leadId, newStatus) => {
    setLeads(prevLeads => prevLeads.map(lead => 
      lead.id === leadId ? { ...lead, currentStatus: newStatus } : lead
    ));
  };
  
  const handleRemarkChange = (leadId, statusType, newRemark) => {
    setLeads(prevLeads => prevLeads.map(lead => 
      lead.id === leadId ? {
        ...lead,
        statuses: {
          ...lead.statuses,
          [statusType]: newRemark
        }
      } : lead
    ));
  };

  const handleSave = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
  
    try {
      await api.put(`/leads/${leadId}/status`, {
        status: lead.currentStatus,
        remark: lead.statuses[lead.currentStatus]
      });
      toast.success('Lead status updated successfully');
      fetchLeads(); // Refresh the leads after saving
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Error updating lead status');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar />
      <div className="container mx-auto w-11/12 py-8">
        <div className='flex items-center gap-3'>
          <h1 className="text-2xl font-bold">Lead Dashboard</h1>
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

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 sticky top-0 text-sm">
                <tr>
                  {['Id', 'Name', 'DOB', 'Whatsapp Mobile', 'Email', 'City', 'Country', 'Investment Timeline', 'Investment Duration', 'Risk Understanding', 'Previous Mutual Fund Experience', 'Investment Type', 'Investment Amount', 'Monthly Income', 'LIC Premium', 'Ideal Call Time', 'Interested Products', 'Prefer Rahul Kulkarni', 'Is NRI', 'Specific Issues', 'Created At', 'Status', 'Remark', 'Actions'].map((header, index) => (
                    <th key={index} className="px-4 py-2 text-center border-b border-gray-100">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='text-sm'>
                {leads.map((lead, index) => (
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
                    <td className='px-4 py-2 border-b border-gray-100 text-center'>{lead.ideal_call_time}</td>
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
                          className='bg-blue-500 text-white px-4 py-1 rounded'
                        >
                          Save
                        </button>
                      </td>
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

export default Dashboard;
