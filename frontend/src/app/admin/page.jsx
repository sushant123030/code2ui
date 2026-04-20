"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAppContext } from "../../context/AppContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function formatDate(value) {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleString();
  } catch (err) {
    return value;
  }
}

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const router = useRouter();
  const {
    token,
    isAuthenticated,
    isAdmin,
    loading: authLoading,
  } = useAppContext();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !isAdmin) {
      setError("Admin access is restricted to admin users.");
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch users
        const usersResponse = await fetch(`${API_URL}/user/getall`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!usersResponse.ok) {
          const body = await usersResponse.json().catch(() => ({}));
          throw new Error(
            body.message || `Failed to load users (${usersResponse.status})`,
          );
        }

        const usersData = await usersResponse.json();
        setUsers(Array.isArray(usersData) ? usersData : []);

        // Fetch contact messages
        const contactResponse = await fetch(`${API_URL}/contact/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (contactResponse.ok) {
          const contactData = await contactResponse.json();
          setContactMessages(contactData.data || []);
        }
      } catch (err) {
        console.error("Admin panel fetch error:", err);
        setError(err.message || "Unable to load admin data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated, isAdmin, token, router]);

  const handleDeleteMessage = async (messageId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const url = API_URL + "/contact/" + messageId;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) return;

      setContactMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId),
      );
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        API_URL + "/contact/mark-read/" + messageId,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) return;

      const updatedMessage = await response.json();
      setContactMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? updatedMessage.data : msg,
        ),
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-elevated text-text-primary">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-20 pt-28">
        <section className="mb-10">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-secondary via-green-primary to-green-muted">
            Admin Panel
          </h1>
          <p className="text-text-secondary mt-3 max-w-2xl">
            Manage users, view contact messages, and monitor platform activity.
          </p>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-border-color">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
              activeTab === "users"
                ? "border-green-primary text-green-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            👥 Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
              activeTab === "messages"
                ? "border-green-primary text-green-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            💬 Contact Messages ({contactMessages.length})
          </button>
        </div>

        <section className="space-y-6">
          {loading ? (
            <div className="rounded-3xl border border-border-color bg-bg-secondary/80 p-10 text-center text-text-secondary shadow-xl shadow-black/10">
              Loading admin data...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-red-200">
              <p className="text-lg font-semibold">Unable to load data</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : activeTab === "users" ? (
            // Users Section
            <div className="overflow-x-auto rounded-3xl border border-border-color bg-bg-secondary/80 shadow-xl shadow-black/10">
              <table className="min-w-full text-left border-separate border-spacing-0">
                <thead className="bg-bg-secondary/90">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-text-secondary border-b border-border-color">
                      Name
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-text-secondary border-b border-border-color">
                      Email
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-text-secondary border-b border-border-color">
                      Provider
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-text-secondary border-b border-border-color">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-text-secondary border-b border-border-color">
                      User ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-text-secondary"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="odd:bg-bg-primary/50 even:bg-bg-secondary/50 hover:bg-bg-secondary/80 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-text-primary border-b border-border-color">
                          {user.fullName || user.name || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary border-b border-border-color break-all">
                          {user.email || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary border-b border-border-color">
                          {user.provider || "local"}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary border-b border-border-color">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary border-b border-border-color break-all">
                          {user._id}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            // Contact Messages Section
            <div className="space-y-4">
              {contactMessages.length === 0 ? (
                <div className="rounded-3xl border border-border-color bg-bg-secondary/80 p-10 text-center text-text-secondary shadow-xl shadow-black/10">
                  No contact messages yet.
                </div>
              ) : (
                contactMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`rounded-2xl border-2 p-6 transition-all duration-300 ${
                      message.isRead
                        ? "border-border-color bg-bg-secondary/50"
                        : "border-green-primary/50 bg-green-primary/5 shadow-lg shadow-green-primary/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {message.subject}
                          </h3>
                          {!message.isRead && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-primary/20 text-green-200 border border-green-primary/50">
                              New
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-text-secondary">
                          <p>
                            <span className="font-semibold text-text-primary">
                              From:{" "}
                            </span>
                            {message.name} ({message.email})
                          </p>
                          <p>
                            <span className="font-semibold text-text-primary">
                              Date:{" "}
                            </span>
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!message.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(message._id)}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-green-primary/20 text-green-200 hover:bg-green-primary/30 border border-green-primary/50 transition-all duration-300"
                          >
                            ✓ Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/50 transition-all duration-300"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    <div className="bg-bg-primary/50 rounded-lg p-4 border border-border-color">
                      <p className="text-text-primary whitespace-pre-wrap text-sm leading-relaxed">
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
