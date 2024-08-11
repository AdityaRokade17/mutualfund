import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import profile from "../assets/profile.png"
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const NavBar = () => {
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    const navigate = useNavigate();

    const [showDropdown, setShowDropdown] = useState(false);
    const [showStaffDropdown, setShowStaffDropdown] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        toast.success("Signed Out Successfully!")
        navigate('/');
    };

    useEffect(() => {
        const logoutTimeout = setTimeout(() => {
          handleLogout();
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    
        return () => clearTimeout(logoutTimeout);
    }, [handleLogout]);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };
    const toggleStaffDropdown = () => {
        setShowStaffDropdown(!showStaffDropdown);
    };

    return (
        <div>
            <nav className='w-full py-3 bg-blue-200'>
                <div className='w-11/12 flex justify-between items-center mx-auto'>
                    <h1 className='font-semibold text-3xl'>MutualFund</h1>

                    <div className='flex items-center'>

                    {userRole === 'superadmin' && (
                        <div className='relative'>
                            <div className='flex justify-center items-center '  onClick={toggleStaffDropdown}>
                                <button
                                    className='px-4 py-2 flex items-center font-medium'
                                >
                                    Staff
                                    {showStaffDropdown ? (
                                        <ChevronUpIcon className="w-5 h-5 ml-1" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 ml-1" />
                                    )}

                                </button>
                            </div>
                            {showStaffDropdown && (
                                <div className='absolute right-0 mt-2 w-48 bg-white shadow-lg rounded'>
                                    <Link
                                        to="/register-subprofile"
                                        className='block px-4 py-2 hover:bg-gray-200'
                                    >
                                        Create Staff Profile
                                    </Link>
                                    <Link to="/subprofiles"
                                        className='block w-full text-left px-4 py-2 hover:bg-gray-200'
                                    >
                                        View Staff
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}


                        <div className='relative'>
                            <div className='flex justify-center items-center'  onClick={toggleDropdown}>
                                <img className="w-10 h-10 rounded-full bg-cover" src={profile} alt="user photo"/>
                                <button
                                    className='px-4 py-2 flex items-center font-medium'
                                
                                >
                                    {username}

                                    {showDropdown ? (
                                        <ChevronUpIcon className="w-5 h-5 ml-1" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 ml-1" />
                                    )}

                                </button>
                            </div>
                            {showDropdown && (
                                <div className='absolute right-0 mt-2 w-48 bg-white shadow-lg rounded'>
                                    <Link
                                        to="/dashboard"
                                        className='block px-4 py-2 hover:bg-gray-200'
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        className='block w-full text-left px-4 py-2 hover:bg-gray-200'
                                        onClick={handleLogout}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default NavBar;