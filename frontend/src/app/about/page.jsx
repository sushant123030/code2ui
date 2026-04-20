"use client";

import React from "react";
import { motion } from "motion/react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Section from "../../components/Section";
import Container from "../../components/Container";
import Card from "../../components/Card";
import { FiTarget, FiEye, FiZap, FiUsers, FiAward } from "react-icons/fi";

const AboutUs = () => {
  const values = [
    {
      icon: FiZap,
      title: "Innovation",
      desc: "We embrace creativity and continuously push the boundaries of design.",
    },
    {
      icon: FiUsers,
      title: "Collaboration",
      desc: "Teamwork is at the heart of everything we do, fostering shared success.",
    },
    {
      icon: FiAward,
      title: "Excellence",
      desc: "We deliver top-quality results that exceed expectations every time.",
    },
  ];

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
              <span className="gradient-text">About Us</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              At UI Generator, we turn imagination into reality. Our platform
              empowers developers and designers to create beautiful, responsive,
              and futuristic UI designs with the help of AI technology.
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Mission & Vision Section */}
      <Section
        className="py-20"
        gradient="from-purple-950/40 via-slate-950 to-slate-950"
      >
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our Mission & Vision
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card variant="elevated" className="h-full p-10">
                <div className="mb-4 inline-block p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <FiTarget className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Our Mission
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  To revolutionize UI/UX design by providing intelligent tools
                  that accelerate creativity, streamline workflow, and make
                  high-quality design accessible to everyone, regardless of
                  their technical background.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card variant="elevated" className="h-full p-10">
                <div className="mb-4 inline-block p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <FiEye className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Our Vision
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  To become the most trusted platform for AI-driven design,
                  inspiring innovation and helping creators build extraordinary
                  digital experiences faster than ever before. We aim to
                  democratize design for all.
                </p>
              </Card>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Core Values Section */}
      <Section
        className="py-20"
        gradient="from-slate-950 via-blue-950/30 to-slate-950"
      >
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              These principles guide everything we do and shape our culture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card variant="default" className="h-full p-8 text-center">
                    <div className="mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">
                      {value.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {value.desc}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section
        className="py-20"
        gradient="from-purple-950/40 via-slate-950 to-blue-950/20"
      >
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "UI Designs Created" },
              { number: "500+", label: "Happy Designers" },
              { number: "50+", label: "Team Members" },
              { number: "24/7", label: "Support Available" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center"
              >
                <h3 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
};

export default AboutUs;
