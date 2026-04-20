"use client";

import React from "react";
import { motion } from "motion/react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  asChild = false,
  ...props
}) => {
  const baseClasses =
    "font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-gradient-to-r from-green-primary to-green-secondary hover:from-[#6fa6ff] hover:to-[#4f8cff] text-bg-primary shadow-[0_20px_60px_rgba(79,140,255,0.25)] hover:shadow-[0_24px_70px_rgba(79,140,255,0.3)]",
    secondary:
      "bg-[#262626] text-text-secondary hover:bg-[#2d2d2d] shadow-[0_20px_40px_rgba(0,0,0,0.25)] border border-[#333333]",
    outline:
      "border-2 border-green-primary text-green-primary hover:bg-green-primary/10 hover:border-green-secondary",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };

  const buttonClass = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      className: `${child.props.className || ""} ${buttonClass}`.trim(),
      disabled: disabled || loading,
      ...props,
    });
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={buttonClass}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
