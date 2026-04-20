"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Container from "../../components/Container";
import Card from "../../components/Card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SignUp = () => {
  const router = useRouter();
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    apple: false,
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .required("Full name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const res = await axios.post(`${API_URL}/api/auth/signup`, values);
        if (res.status === 201 || res.status === 200) {
          toast.success("Signup successful!");
          resetForm();
          router.push("/login");
        }
      } catch (error) {
        toast.error(
          "Signup failed: " +
            (error.response?.data?.message || "Unknown error"),
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleSocialSignup = (provider) => {
    setSocialLoading((prev) => ({ ...prev, [provider]: true }));
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a0a2e] to-[#0f0f23] flex items-center justify-center relative overflow-hidden py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], x: [-20, 20, -20] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/30 rounded-full mix-blend-screen filter blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [20, -20, 20] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-600/30 rounded-full mix-blend-screen filter blur-3xl"
        />
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <Container className="px-4">
          <Card variant="elevated" className="p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2">
                Create <span className="gradient-text">Account</span>
              </h2>
              <p className="text-gray-400 text-sm">
                Join the AI-powered design revolution
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => handleSocialSignup("apple")}
                disabled={socialLoading.apple}
              >
                <FaApple size={18} />
                {socialLoading.apple ? "Signing up..." : "Sign up with Apple"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => handleSocialSignup("google")}
                disabled={socialLoading.google}
              >
                <FcGoogle size={18} />
                {socialLoading.google ? "Signing up..." : "Sign up with Google"}
              </Button>
            </div>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                or
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="fullName"
                type="text"
                placeholder="John Doe"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.fullName}
                error={formik.errors.fullName}
                touched={formik.touched.fullName}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                error={formik.errors.email}
                touched={formik.touched.email}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                error={formik.errors.password}
                touched={formik.touched.password}
              />

              <Button
                type="submit"
                disabled={formik.isSubmitting}
                loading={formik.isSubmitting}
                variant="primary"
                size="md"
                className="w-full mt-6"
              >
                {formik.isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-gray-400 text-sm text-center mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-medium transition"
              >
                Login here
              </Link>
            </p>
          </Card>
        </Container>
      </motion.div>
    </div>
  );
};

export default SignUp;
