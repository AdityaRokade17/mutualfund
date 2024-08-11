import React, { useState } from 'react';
import axios from 'axios';
import '../components/LeadForm.css'; // Ensure this file includes any additional custom styles
import api from "../utils/api"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LeadForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    whatsapp_mobile: '',
    email: '',
    city: '',
    country: '',
    investment_timeline: '',
    investment_duration: '',
    risk_understanding: '',
    previous_mutual_fund_experience: '',
    investment_type: '',
    investment_amount: '',
    monthly_income: '',
    lic_premium: '',
    ideal_call_time: '',
    interested_products: '',
    prefer_rahul_kulkarni: '',
    is_nri: '',
    specific_issues: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    date_of_birth: '',
    whatsapp_mobile: '',
    city: '',
    country: '',
    investment_amount: '',
    monthly_income: '',
    lic_premium: '',
    ideal_call_time: '',
    specific_issues: ''
  });

  const requiredFields = [
    'name', 'date_of_birth', 'whatsapp_mobile', 'city', 'country',
    'investment_timeline', 'investment_duration', 'risk_understanding',
    'previous_mutual_fund_experience', 'investment_type', 'investment_amount',
    'monthly_income', 'lic_premium', 'ideal_call_time', 'interested_products',
    'prefer_rahul_kulkarni', 'is_nri', 'specific_issues'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

  // For fields that should only contain numbers
    if (['investment_amount', 'monthly_income', 'lic_premium'].includes(name)) {
      if (!validateNumberInput(value)) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: 'Please enter numbers only'
        }));
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: ''
        }));
      }
    } else {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
 
    // setErrors(prevErrors => ({
    //   ...prevErrors,
    //   [name]: '' // Clear error on input change
    // }));

  };

  const validateNumberInput = (value) => {
    return /^\d*$/.test(value);
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedOptions = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);

    setFormData(prevState => ({
      ...prevState,
      [name]: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    requiredFields.forEach(field => {
      if (formData[field] === '') {
        newErrors[field] = 'This field is required';
      }
    });

    ['investment_amount', 'monthly_income', 'lic_premium'].forEach(field => {
      if (formData[field] && !validateNumberInput(formData[field])) {
        newErrors[field] = 'Please enter numbers only';
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      toast.error("There is something missing. Please check all required fields.")
      setErrors(newErrors);
      return;
    }


    try {
      const response = await api.post('/leads/create', formData);

      toast.success('Thank you for your submission! We will get back to you soon.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",

      });
      
      setFormData({
        name: '',
        date_of_birth: '',
        whatsapp_mobile: '',
        email: '',
        city: '',
        country: '',
        investment_timeline: '',
        investment_duration: '',
        risk_understanding: '',
        previous_mutual_fund_experience: '',
        investment_type: '',
        investment_amount: '',
        monthly_income: '',
        lic_premium: '',
        ideal_call_time: '',
        interested_products: '',
        prefer_rahul_kulkarni: '',
        is_nri: '',
        specific_issues: ''
      });
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('Error submitting lead. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-0 lg:mt-10">
      {/* <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Lead Form</h2> */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Rahul Kulkarni - Dhansamrudhi</h1>
        <p className="text-gray-600 mb-4">We are on a mission to help 1,00,000 people achieve Financial Freedom through Mutual Funds.
                By Submitting this form, you acknowledge your acceptance of all policies and conditions outlined by Rahul Kulkarni-Dhansamrudhi.
                Expect our team to contact you within 24-72 hours after form submission.</p>

      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            
            className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}          

            />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Date Of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            
            className={`border ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.date_of_birth ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}          
          />
          {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Whatsapp Mobile No.</label>
          <input
            type="text"
            name="whatsapp_mobile"
            value={formData.whatsapp_mobile}
            onChange={handleChange}
            placeholder="Whatsapp Mobile No."
            
            className={`border ${errors.whatsapp_mobile ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.whatsapp_mobile ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}          
          />
          {errors.whatsapp_mobile && <p className="text-red-500 text-sm mt-1">{errors.whatsapp_mobile}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Email Id</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Id (optional)"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            
            className={`border ${errors.city ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.city ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}          
          />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            
            className={`border ${errors.country ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.country ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}          
          />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">When do you wish to Invest?</label>
          <select
            name="investment_timeline"
            value={formData.investment_timeline}
            onChange={handleChange}
            
            className={`border ${errors.investment_timeline ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.investment_timeline ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            >
            <option value="">Select</option>
            <option value="Immediately">A) Immediately</option>
            <option value="Within a week">B) Within a week</option>
            <option value="Within a month">C) Within a month</option>
            <option value="Others">D) Others</option>
          </select>
          {errors.investment_timeline && <p className="text-red-500 text-sm mt-1">{errors.investment_timeline}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">For how many years you would like to invest in Mutual Funds?</label>
          <select
            name="investment_duration"
            value={formData.investment_duration}
            onChange={handleChange}
            
            className={`border ${errors.investment_duration ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.investment_duration ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            >
            <option value="">Select</option>
            <option value="5-10">A) 5-10</option>
            <option value=">10 years">B) {'>'}10 years</option>
          </select>
          {errors.investment_duration && <p className="text-red-500 text-sm mt-1">{errors.investment_duration}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Do you understand the risk & volatility involved? If yes, how much risk are you willing to take?</label>
          <select
            name="risk_understanding"
            value={formData.risk_understanding}
            onChange={handleChange}
            
            className={`border ${errors.risk_understanding ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.risk_understanding ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            >
            <option value="">Select</option>
            <option value="Less Risk">A) Less Risk</option>
            <option value="Medium Risk">B) Medium Risk</option>
            <option value="High Risk">C) High Risk</option>
          </select>
          {errors.risk_understanding && <p className="text-red-500 text-sm mt-1">{errors.risk_understanding}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Have you invested in Mutual Funds before?</label>
          <select
            name="previous_mutual_fund_experience"
            value={formData.previous_mutual_fund_experience}
            onChange={handleChange}
            
            className={`border ${errors.previous_mutual_fund_experience ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.previous_mutual_fund_experience ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            >
            <option value="">Select</option>
            <option value="Yes">A) Yes</option>
            <option value="No">B) No</option>
          </select>
          {errors.previous_mutual_fund_experience && <p className="text-red-500 text-sm mt-1">{errors.previous_mutual_fund_experience}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">What type of Investments are you interested in?</label>
          <select
            name="investment_type"
            value={formData.investment_type}
            onChange={handleChange}
            
            className={`border ${errors.investment_type ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.investment_type ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            >
            <option value="">Select</option>
            <option value="SIP">A) SIP</option>
            <option value="Lumpsum">B) Lumpsum</option>
          </select>
          {errors.investment_type && <p className="text-red-500 text-sm mt-1">{errors.investment_type}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Amount of Investment?</label>
          <input
            type="text"
            name="investment_amount"
            value={formData.investment_amount}
            onChange={handleChange}
            placeholder="Amount"
            
            className={`border ${errors.investment_amount ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.investment_amount ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            />
              {errors.investment_amount && <p className="text-red-500 text-sm mt-1">{errors.investment_amount}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">What is current monthly Income ?</label>
          <input
            type="text"
            name="monthly_income"
            value={formData.monthly_income}
            onChange={handleChange}
            placeholder="Monthly Income"
            
            className={`border ${errors.monthly_income ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.monthly_income ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            />
              {errors.monthly_income && <p className="text-red-500 text-sm mt-1">{errors.monthly_income}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">How much Monthly premium do you pay for LIC? If you don't have LIC, write zero.</label>
          <input
            type="text"
            name="lic_premium"
            value={formData.lic_premium}
            onChange={handleChange}
            placeholder="LIC Premium"
            
            className={`border ${errors.lic_premium ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.lic_premium ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            />
              {errors.lic_premium && <p className="text-red-500 text-sm mt-1">{errors.lic_premium}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">What is the Ideal time to call ?</label>
          <input
            type="text"
            name="ideal_call_time"
            value={formData.ideal_call_time}
            onChange={handleChange}
            placeholder="Best Time to Call"
            
            className={`border ${errors.ideal_call_time ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.ideal_call_time ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            />
            {errors.ideal_call_time && <p className="text-red-500 text-sm mt-1">{errors.ideal_call_time}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Are you interested in Other Products ?</label>
          <select
            name="interested_products"
            value={formData.interested_products}
            onChange={handleChange}
            
            className={`border ${errors.interested_products ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.interested_products ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            >
            <option value="">Select</option>
            <option value="Mediclaim">A) Mediclaim</option>
            <option value="Term Insurance">B) Term Insurance</option>
            <option value="Both">C) Both</option>
            <option value="Review Existing LIC Policies">D) Review Existing LIC Policies</option>
            <option value="All of the above">E) All of the above</option>
            <option value="None Of the Above">F) None Of the Above</option>
          </select>
          {errors.interested_products && <p className="text-red-500 text-sm mt-1">{errors.interested_products}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Would you prefer doing Investments through Rahul Kulkarni ?</label>
          <select
            name="prefer_rahul_kulkarni"
            value={formData.prefer_rahul_kulkarni}
            onChange={handleChange}
            
            className={`border ${errors.prefer_rahul_kulkarni ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.prefer_rahul_kulkarni ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            >
            <option value="">Select</option>
            <option value="Yes">A) Yes</option>
            <option value="No">B) No</option>
          </select>
          {errors.prefer_rahul_kulkarni && <p className="text-red-500 text-sm mt-1">{errors.prefer_rahul_kulkarni}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Are you NRI ?</label>
          <select
            name="is_nri"
            value={formData.is_nri}
            onChange={handleChange}
            
            className={`border ${errors.is_nri ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.is_nri ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            >
            <option value="">Select</option>
            <option value="Yes">A) Yes</option>
            <option value="No">B) No</option>
          </select>
          {errors.is_nri && <p className="text-red-500 text-sm mt-1">{errors.is_nri}</p>}

        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Any specific issue related to personal finance which you want to discuss in detail ?</label>
          <textarea
            name="specific_issues"
            value={formData.specific_issues}
            onChange={handleChange}
            placeholder="Specific Issues or Queries"
            rows="4"
            className={`border ${errors.specific_issues ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg focus:outline-none focus:ring-2 ${errors.specific_issues ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
            />
              {errors.specific_issues && <p className="text-red-500 text-sm mt-1">{errors.specific_issues}</p>}

        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default LeadForm;
