// app/contact/page.js
"use client";

import React from "react";
import { motion } from "motion/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Section from "../../components/Section";
import Container from "../../components/Container";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const ContactUs = () => {
  const contactInfo = [
    {
      icon: FiMail,
      label: "Email",
      value: "hello@uigenerator.com",
      link: "mailto:hello@uigenerator.com",
    },
    {
      icon: FiPhone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: FiMapPin,
      label: "Address",
      value: "San Francisco, CA 94105",
      link: "#",
    },
  ];

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      subject: Yup.string()
        .min(5, "Subject must be at least 5 characters")
        .required("Subject is required"),
      message: Yup.string()
        .min(10, "Message must be at least 10 characters")
        .required("Message is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/contact/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Failed to send message. Please try again.",
          );
        }

        const data = await response.json();
        toast.success(
          data.message ||
            "Message sent successfully! We will get back to you soon.",
        );
        resetForm();
      } catch (error) {
        console.error("Contact form error:", error);
        toast.error(
          error.message || "Failed to send message. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a0a2e] to-[#0f0f23] flex flex-col text-white font-sans overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <Section className="py-40 md:py-52 pt-32 text-center">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="gradient-text">Get in Touch</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Have a question, suggestion, or want to collaborate? We'd love to
              hear from you. Fill out the form below and our team will get back
              to you shortly.
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Contact Information & Form Section */}
      <Section
        className="py-20"
        gradient="from-slate-950 via-purple-950/30 to-slate-950"
      >
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, idx) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card variant="default" className="h-full p-8 text-center">
                    <div className="mb-4 inline-block p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      {info.label}
                    </h3>
                    <a
                      href={info.link}
                      className="text-gray-400 hover:text-purple-400 transition-colors break-words"
                    >
                      {info.value}
                    </a>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <Card variant="elevated" className="p-10">
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                    error={formik.errors.name}
                    touched={formik.touched.name}
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
                </div>

                <Input
                  label="Subject"
                  name="subject"
                  type="text"
                  placeholder="How can we help?"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.subject}
                  error={formik.errors.subject}
                  touched={formik.touched.subject}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.message}
                    className={`w-full px-4 py-3 rounded-lg bg-slate-900/50 border transition-all duration-300 outline-none resize-none
                      ${
                        formik.touched.message && formik.errors.message
                          ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                          : "border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      }
                      text-white placeholder-gray-400`}
                  />
                  {formik.touched.message && formik.errors.message && (
                    <p className="mt-1 text-xs text-red-400">
                      {formik.errors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={formik.isSubmitting}
                  loading={formik.isSubmitting}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {formik.isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </motion.div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
};

export default ContactUs;
