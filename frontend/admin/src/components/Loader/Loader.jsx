// src/components/Loader.js
import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="loader-overlay flex-col">
      <div className="stock-loader">
        <div className="graph-container">
          <div className="bar bar1"></div>
          <div className="bar bar2"></div>
          <div className="bar bar3"></div>
          <div className="bar bar4"></div>
          <div className="bar bar5"></div>
        </div>
      </div>
      <p className='mt-3'>Fetching your data...</p>
    </div>
  );
};

export default Loader;
