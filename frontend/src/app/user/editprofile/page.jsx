"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const uploadToCloudinary = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "uiinspire");
    fd.append("cloud_name", "dxnhq2zvs");

    axios
      .post("https://api.cloudinary.com/v1_1/dxnhq2zvs/image/upload", fd)
      .then((result) => {
        toast.success("Image uploaded successfully");
        console.log(result.data);
        setProfileImage(file);
        setImageUrl(result.data.url);
        setPreviewImage(result.data.url);
      })
      .catch((err) => {
        toast.error("Error while uploading image");
        console.log(err);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/getuser`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const data = await res.json();
        setUser(data);
        setName(data.name);
        setEmail(data.email);
        setImageUrl(data.profileImage || "");
        setPreviewImage(data.profileImage || "");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data");
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!name || !email) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      const updateData = {
        name,
        email,
        profileImage: imageUrl, // Use the Cloudinary URL
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      console.log("Profile updated:", data);

      toast.success("Profile updated successfully!");
      setMessage("Profile updated successfully!");

      // setTimeout(() => {
      //   router.push('/user/profile');
      // }, 1500);
    } catch (err) {
      console.error("Update failed", err);
      setError(err.message || "Failed to update profile. Please try again.");
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center
        bg-gradient-to-br from-[#050505] via-[#0a0a1a] to-[#0f001f] text-white"
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a1a] to-[#0f001f] text-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 rounded-2xl
          bg-gradient-to-br from-[#0f0f1f] to-[#14142f]
          border border-purple-800/40
          shadow-[0_0_35px_rgba(168,85,247,0.25)]"
        >
          <h2 className="text-2xl font-bold text-purple-300 mb-8">
            Edit Profile
          </h2>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-600 shadow-[0_0_25px_rgba(168,85,247,0.5)]">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black/40 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadToCloudinary}
                  disabled={uploading}
                  className="hidden"
                />
                <span
                  className={`text-purple-400 font-bold hover:underline block text-center ${uploading ? "opacity-50" : ""}`}
                >
                  {uploading
                    ? "Uploading..."
                    : previewImage
                      ? "Change Profile Picture"
                      : "Upload Profile Picture"}
                </span>
              </label>

              {imageUrl && (
                <p className="text-xs text-gray-400 text-center break-all max-w-xs">
                  Image URL: {imageUrl}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-black/40
                border border-purple-700/40 text-white
                focus:outline-none focus:ring-2 focus:ring-purple-600
                disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-black/40
                border border-purple-700/40 text-white
                focus:outline-none focus:ring-2 focus:ring-purple-600
                disabled:opacity-50"
              />
            </div>

            <div className="flex gap-4 pt-4">
              {message && (
                <div className="w-full p-3 bg-green-600/20 text-green-300 rounded-xl text-sm">
                  ✓ {message}
                </div>
              )}
              {error && (
                <div className="w-full p-3 bg-red-600/20 text-red-300 rounded-xl text-sm">
                  ✗ {error}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700
                rounded-xl font-semibold transition
                shadow-[0_0_25px_rgba(168,85,247,0.5)] disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading || uploading}
                className="px-6 py-3 bg-blue-600/20 text-blue-300
                hover:bg-blue-600/30 rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
