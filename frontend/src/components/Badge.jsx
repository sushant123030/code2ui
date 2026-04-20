"use client";

import React from "react";

const Badge = ({ children, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-purple-500/20 text-purple-300 border border-purple-500/40",
    secondary: "bg-blue-500/20 text-blue-300 border border-blue-500/40",
    success: "bg-green-500/20 text-green-300 border border-green-500/40",
    warning: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
    danger: "bg-red-500/20 text-red-300 border border-red-500/40",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
