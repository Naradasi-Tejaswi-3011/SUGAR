"use client";

import React from 'react';

const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8e7f3] bg-gradient-to-b from-[#f8e7f3] to-[#fff5fc] p-4">
      {children}
    </div>
  );
};

export default PageWrapper; 