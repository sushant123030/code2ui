"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import Button from "../components/Button";
import Card from "../components/Card";
import Section from "../components/Section";
import Container from "../components/Container";
import ProjectSection from "../components/ProjectSection";
import { useRouter } from "next/navigation";
import {
  FiZap,
  FiLayout,
  FiCode,
  FiAward,
  FiBarChart2,
  FiShield,
} from "react-icons/fi";

const Home = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const features = [
    {
      icon: FiZap,
      title: "AI-Powered Design",
      desc: "Generate stunning layouts instantly with smart AI assistance that understands your creative intent.",
    },
    {
      icon: FiLayout,
      title: "Customizable Templates",
      desc: "Choose from diverse, professionally-designed templates and customize them to match your vision.",
    },
    {
      icon: FiCode,
      title: "Export Clean Code",
      desc: "Export production-ready HTML, CSS, and React code for immediate implementation.",
    },
    {
      icon: FiAward,
      title: "Professional Quality",
      desc: "Create designs that rival professional UI/UX designers with AI guidance and tools.",
    },
    {
      icon: FiBarChart2,
      title: "Performance Optimized",
      desc: "All generated designs are optimized for speed, accessibility, and user experience.",
    },
    {
      icon: FiShield,
      title: "Secure & Private",
      desc: "Your projects and designs are encrypted and stored securely with full privacy protection.",
    },
  ];

  const stats = [
    { number: "10K+", label: "UI Designs Created" },
    { number: "500+", label: "Happy Designers" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/user/projectHistory");
    } else {
      router.push("/signup");
    }
  };

  const handleQuickGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please enter a prompt to generate UI");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      // Create a new project
      const createResponse = await fetch(
        `http://localhost:5000/project/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt: trimmed }),
        },
      );

      if (!createResponse.ok) {
        throw new Error("Failed to create project");
      }

      const projectData = await createResponse.json();
      const projectId = projectData._id;

      // Generate and save the UI
      const generateResponse = await fetch(
        `http://localhost:5000/project/generate-and-save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt: trimmed, projectId }),
        },
      );

      if (!generateResponse.ok) {
        throw new Error("Failed to generate UI");
      }

      // Redirect to the generator page
      router.push(`/user/generator/${projectId}`);
    } catch (err) {
      console.error("Quick generate error:", err);
      setError(err.message || "Failed to generate UI. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col text-white font-sans overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 relative py-40 md:py-52 pt-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-24 -left-16 w-96 h-96 bg-green-primary/15 rounded-full mix-blend-screen filter blur-3xl"
          ></motion.div>
          <motion.div
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-10 right-10 w-96 h-96 bg-green-secondary/15 rounded-full mix-blend-screen filter blur-3xl"
          ></motion.div>
          <motion.div
            animate={{ x: [-50, 50, -50] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute top-1/2 left-1/4 w-64 h-64 bg-green-muted/10 rounded-full mix-blend-screen filter blur-3xl"
          ></motion.div>
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-4xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-block"
          >
            <div className="px-4 py-2 rounded-full bg-green-primary/15 border border-green-primary/30 backdrop-blur-sm">
              <p className="text-green-secondary text-sm font-medium">
                ✨ Welcome to the Future of UI Design
              </p>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            <span className="gradient-text">Transform Ideas</span>
            <br />
            <span className="gradient-text">into Stunning UI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Turn your imagination into reality with AI-driven UI design. Whether
            you're a developer or designer, our intelligent platform helps you
            create stunning interfaces faster than ever before.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6"
          >
            <Button size="lg" variant="primary" onClick={handleGetStarted}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline">
              <Link href="/about">Learn More</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <Section
        className="py-16"
        gradient="from-[#0D0D0D] via-[#161616] to-[#0D0D0D]"
      >
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
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
                <p className="text-gray-400 text-sm md:text-base">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section
        className="py-24"
        gradient="from-[#111111] via-[#1A1A1A] to-[#111111]"
      >
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to create professional UI designs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card variant="elevated" className="h-full p-8">
                    <div className="mb-4 inline-block p-3 rounded-lg bg-green-primary/10 border border-green-primary/20">
                      <Icon className="w-6 h-6 text-green-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </Section>

      <ProjectSection />

      {/* CTA Section */}
      <Section
        className="py-20"
        gradient="from-[#111111] via-[#161616] to-[#111111]"
      >
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Create?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of designers and developers who are already
              creating beautiful UIs with our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="primary" onClick={handleGetStarted}>
                Start Designing Now
              </Button>
              <Button size="lg" variant="outline">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
};

export default Home;
