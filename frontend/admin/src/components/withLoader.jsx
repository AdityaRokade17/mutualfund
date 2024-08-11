// src/components/withLoader.js
import React, { useState, useEffect } from 'react';
import Loader from './Loader/Loader'; // Import your Loader component

const withLoader = (WrappedComponent) => {
  return (props) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Simulate a loading delay (e.g., API call)
      const timer = setTimeout(() => {
        setLoading(false);
      }, 700); // Adjust time as needed

      return () => clearTimeout(timer);
    }, []);

    return (
      <>
        {loading ? <Loader /> : <WrappedComponent {...props} />}
     
      </>
    );
  };
};

export default withLoader;
