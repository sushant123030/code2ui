"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch all saved projects on load
  useEffect(() => {
    axios
      .get("http://localhost:5000/project/getbyuser", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setProjects(res.data); // expecting an array of projects
        setLoading(false);
      })
      .catch((err) => {
        console.error(" Failed to load projects:", err);
        setError("Failed to load projects. Please try again.");
        setLoading(false);
      });
  }, []);

  const createNewProject = () => {
    axios
      .post(
        "http://localhost:5000/project/add",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      .then((res) => {
        console.log(res.data);
        router.push(`/user/generator/${res.data._id}`);
        // setProjects((prev) => [...prev, res.data]);
      })
      .catch((err) => {
        console.error("Failed to create project:", err);
        setError("Failed to create project. Please try again.");
      });
  };

  const deleteProject = (projectId) => {
    axios
      .delete(
        `${process.env.NEXT_PUBLIC_API_URL}/project/delete/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      .then((res) => {
        toast.success("Project deleted successfully!");
        setProjects((prev) => prev.filter((proj) => proj._id !== projectId));
      })
      .catch((err) => {
        console.error("Failed to delete project:", err);
        toast.error("Failed to delete project. Please try again.");
        // setError('Failed to delete project. Please try again.');
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a1a] to-[#0f001f] text-white font-sans px-6 py-20">
      <Header />

      {/* Header Section */}
      <header className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]"
        >
          My Project Dashboard
        </motion.h1>
        <p className="text-gray-400 text-lg mt-3">
          View, manage, and create your stunning UIs.
        </p>
      </header>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center text-gray-400">Loading projects...</div>
      )}
      {error && <div className="text-center text-red-400">{error}</div>}

      {/* Projects Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* New Project Card */}
          <div
            onClick={createNewProject}
            className="h-56 cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-[#071029] to-[#021026]
                   border-2 border-dashed border-blue-600 flex flex-col items-center justify-center gap-2
                   text-blue-300 hover:shadow-[0_12px_40px_rgba(59,130,246,0.18)] transition group"
          >
            <div className="text-6xl font-extralight select-none group-hover:scale-110 transition-transform">
              +
            </div>
            <div className="font-semibold text-lg">New Project</div>
            <div className="text-xs text-gray-400 mt-1 group-hover:text-blue-400 transition-colors">
              Click to open generator
            </div>
          </div>

          {projects.length > 0 ? (
            projects.map((project) => (
              <motion.div
                key={project._id}
                whileHover={{ scale: 1.04, y: -6 }}
                transition={{ type: "spring", stiffness: 180 }}
                className="p-7 rounded-2xl bg-gradient-to-br from-[#0f0f1f] to-[#121232] border border-purple-800 shadow-[0_0_30px_rgba(168,85,247,0.25)]
                       hover:shadow-[0_0_45px_rgba(168,85,247,0.6)] transition-all flex flex-col justify-between"
              >
                {/* Title */}
                <h3 className="text-2xl font-semibold text-purple-300 mb-3 line-clamp-2">
                  {project.prompt || "Untitled Project"}
                </h3>

                {/* Date */}
                <p className="text-gray-400 text-sm mb-4">
                  Created:{" "}
                  <span className="text-purple-300">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </p>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-6 line-clamp-3">
                  {project.preview || "No description available"}
                </p>

                {/* Buttons */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-purple-700/40">
                  <Link
                    href={`/user/generator/${project._id}`}
                    className="px-4 py-2 rounded-xl bg-blue-600/20 text-blue-300 
                           hover:bg-blue-600/30 transition font-medium"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => deleteProject(project._id)}
                    className="px-4 py-2 rounded-xl bg-red-600/20 text-red-300 
                           hover:bg-red-600/30 transition font-medium"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No projects found. Try creating one!
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DashboardPage;
