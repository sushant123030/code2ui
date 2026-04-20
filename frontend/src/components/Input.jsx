"use client";

import React from "react";

const Input = ({
  label,
  error,
  touched,
  className = "",
  type = "text",
  placeholder = "",
  ...props
}) => {
  const hasError = touched && error;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-lg bg-bg-secondary border transition-all duration-300 outline-none
          ${
            hasError
              ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
              : "border-border-color focus:border-green-primary focus:ring-2 focus:ring-green-primary/20"
          } 
          text-text-primary placeholder-text-secondary ${className}`}
        {...props}
      />
      {hasError && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
