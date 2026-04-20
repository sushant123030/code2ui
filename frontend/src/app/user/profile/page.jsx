"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login first");
          setLoading(false);
          return;
        }

        // Fetch user data
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/getuser`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!userResponse.ok) {
          throw new Error(`User API failed: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        setUser(userData);
        console.log(userData);

        // Fetch projects
        const projectsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/project/getbyuser`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!projectsResponse.ok) {
          console.warn(
            `Projects API failed: ${projectsResponse.status}, using empty array`,
          );
          setProjects([]);
          setLoading(false);
          return;
        }

        const projectsData = await projectsResponse.json();
        console.log(projectsData);
        const projectsList = Array.isArray(projectsData)
          ? projectsData
          : projectsData.projects || [];
        setProjects(projectsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error && !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center
                      bg-gradient-to-br from-[#050505] via-[#0a0a1a] to-[#0f001f]
                      text-white"
      >
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <Link href="/login">
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center
                      bg-gradient-to-br from-[#050505] via-[#0a0a1a] to-[#0f001f]
                      text-white"
      >
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center
                      bg-gradient-to-br from-[#050505] via-[#0a0a1a] to-[#0f001f]
                      text-white"
      >
        <p>No user data found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a1a] to-[#0f001f] text-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-14 pt-24">
        {/* PROFILE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center gap-6 p-8 rounded-2xl
                     bg-gradient-to-br from-[#0f0f1f] to-[#14142f]
                     border border-purple-800/40 shadow-[0_0_35px_rgba(168,85,247,0.25)]"
        >
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500
                            flex items-center justify-center text-3xl font-bold overflow-hidden
                            border-2 border-purple-600 shadow-[0_0_25px_rgba(168,85,247,0.5)]"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
            <button
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700
                             rounded-full flex items-center justify-center text-white text-sm
                             transition shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            >
              ✏️
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-purple-300">
              {user.name || user.fullName}
            </h2>
            <p className="text-gray-400">{user.email}</p>
            <p className="text-gray-500 text-sm mt-1">
              Member since{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          <div className="flex gap-8">
            <Stat label="Projects" value={projects.length} />
            <Stat label="Account" value="Free" />
          </div>
        </motion.div>

        {/* ACCOUNT STATISTICS */}
        <Section title="Account Statistics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div
              className="p-6 rounded-xl bg-gradient-to-br from-[#0f0f1f] to-[#14142f]
                           border border-purple-800/40 text-center"
            >
              <div className="text-3xl font-bold text-cyan-300 mb-2">
                {projects.length}
              </div>
              <div className="text-gray-400 text-sm">Total Projects</div>
            </div>
            <div
              className="p-6 rounded-xl bg-gradient-to-br from-[#0f0f1f] to-[#14142f]
                           border border-purple-800/40 text-center"
            >
              <div className="text-3xl font-bold text-green-300 mb-2">
                {
                  projects.filter(
                    (p) =>
                      new Date(p.createdAt) >
                      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ).length
                }
              </div>
              <div className="text-gray-400 text-sm">This Month</div>
            </div>
            <div
              className="p-6 rounded-xl bg-gradient-to-br from-[#0f0f1f] to-[#14142f]
                           border border-purple-800/40 text-center"
            >
              <div className="text-3xl font-bold text-yellow-300 mb-2">
                {Math.floor(
                  (new Date() - new Date(user.createdAt)) /
                    (1000 * 60 * 60 * 24),
                )}
              </div>
              <div className="text-gray-400 text-sm">Days Active</div>
            </div>
            <div
              className="p-6 rounded-xl bg-gradient-to-br from-[#0f0f1f] to-[#14142f]
                           border border-purple-800/40 text-center"
            >
              <div className="text-3xl font-bold text-purple-300 mb-2">
                Free
              </div>
              <div className="text-gray-400 text-sm">Plan</div>
            </div>
          </div>
        </Section>

        {/* SUBSCRIPTION STATUS */}
        <Section title="Subscription & Billing">
          <div
            className="p-6 rounded-xl bg-gradient-to-br from-[#0f0f1f] to-[#14142f]
                         border border-purple-800/40"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-purple-300">
                  Current Plan
                </h4>
                <p className="text-gray-400">Free Plan</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-300">$0</div>
                <div className="text-gray-500 text-sm">per month</div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Projects created this month
                </span>
                <span className="text-purple-300">{projects.length}/5</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${(projects.length / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            <button
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl
                             font-semibold transition shadow-[0_0_25px_rgba(168,85,247,0.5)]
                             hover:shadow-[0_0_35px_rgba(168,85,247,0.7)]"
            >
              Upgrade to Pro
            </button>
          </div>
        </Section>

        {/* PROJECT HISTORY SHORTCUT */}
        <Section title="Recent Projects">
          {projects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <Link
                    key={project._id || index}
                    href={`/user/generator/${project._id}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      className="p-5 rounded-xl bg-black/40 border border-purple-700/40
                                 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition cursor-pointer
                                 h-full block"
                    >
                      {/* Project Code Preview */}
                      <div
                        className="w-full h-48 mb-4 bg-black/80 rounded-lg overflow-hidden
                                     border border-purple-700/30 flex items-center justify-center
                                     relative group"
                      >
                        {project.codeImage ? (
                          <img
                            src={project.codeImage}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : project.preview ? (
                          <img
                            src={project.preview}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="w-full h-full bg-gradient-to-br from-purple-600/30 to-blue-600/30
                                         flex flex-col items-center justify-center text-gray-400 p-4 text-center"
                          >
                            <div className="text-4xl mb-2">🎨</div>
                            <span className="text-sm">
                              No Preview Available
                            </span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-purple-300 font-semibold truncate">
                        {project.name || "Untitled Project"}
                      </h4>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                        {project.description || "View or regenerate this UI"}
                      </p>
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-gray-500 text-xs">
                          {project.createdAt
                            ? new Date(project.createdAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <span className="text-purple-400 text-xs font-semibold">
                          View →
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Link href="/user/projectHistory">
                  <button
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl 
                                   font-semibold transition shadow-[0_0_25px_rgba(168,85,247,0.5)]
                                   hover:shadow-[0_0_35px_rgba(168,85,247,0.7)]"
                  >
                    View All Projects
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-gray-400">
              No projects yet. Start creating one now!
            </p>
          )}
        </Section>

        {/* ACCOUNT ACTIONS */}
        <Section title="Account Actions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Link href="/user/editprofile">
                <ActionButton label="Edit Profile" icon="👤" />
              </Link>
              <ActionButton label="Change Password" icon="🔒" />
              <ActionButton label="Privacy Settings" icon="🛡️" />
            </div>
            <div className="space-y-4">
              <ActionButton label="Download Data" icon="📥" />
              <ActionButton
                label="Logout"
                icon="🚪"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
              />
              <ActionButton danger label="Delete Account" icon="🗑️" />
            </div>
          </div>
        </Section>

        {/* PREFERENCES */}
        <Section title="Preferences">
          <div className="space-y-4">
            <Preference label="Email Notifications" value="Enabled" />
            <Preference label="Theme" value="Dark" />
            <Preference label="Language" value="English" />
            <Preference label="Timezone" value="UTC" />
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-purple-300 mb-6">{title}</h3>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-cyan-300">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}

function Preference({ label, value }) {
  return (
    <div
      className="flex justify-between p-4 mb-3 rounded-xl
                    bg-black/40 border border-purple-700/30"
    >
      <span className="text-gray-300">{label}</span>
      <span className="text-purple-300 font-medium">{value}</span>
    </div>
  );
}

function ActionButton({ label, danger, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition
        ${
          danger
            ? "bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-600/30"
            : "bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-600/30"
        }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}
