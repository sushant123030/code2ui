"use client";

import React from "react";
import { motion } from "motion/react";

const Card = ({
  children,
  className = "",
  variant = "default",
  hover = true,
  ...props
}) => {
  const variants = {
    default:
      "bg-[#1A1A1A] border border-[#333333] hover:border-green-primary/40",
    dark: "bg-[#0D0D0D] border border-bg-elevated hover:border-green-muted/70",
    light:
      "bg-bg-elevated border border-border-color hover:border-green-secondary/20",
    elevated:
      "bg-[#1F1F1F] border border-green-primary/20 hover:border-green-primary/40 shadow-[0_25px_60px_rgba(79,140,255,0.14)]",
  };

  const baseClass = "rounded-xl backdrop-blur-sm transition-all duration-300";

  return (
    <motion.div
      whileHover={
        hover ? { y: -4, boxShadow: "0 10px 30px rgba(0, 255, 136, 0.2)" } : {}
      }
      className={`${baseClass} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
