"use client";

import React from "react";
import { motion } from "motion/react";

const Section = ({
  children,
  className = "",
  gradient = "from-bg-primary via-bg-secondary to-bg-primary",
  id = "",
  ...props
}) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-100px" }}
      className={`relative w-full py-20 px-6 bg-gradient-to-b ${gradient} ${className}`}
      id={id}
      {...props}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-secondary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
};

export default Section;
