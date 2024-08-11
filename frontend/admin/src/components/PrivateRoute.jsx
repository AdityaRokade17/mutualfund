import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    return Component; // Render the passed component if token exists
  } else {
    return <Navigate to="/" />; // Redirect to login if token doesn't exist
  }
};

export default PrivateRoute;
