"use client";

import React from "react";

const Container = ({ children, className = "", ...props }) => {
  return (
    <div className={`max-w-7xl mx-auto w-full px-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Container;
