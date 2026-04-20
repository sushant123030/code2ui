"use client";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const AppContext = createContext();

// App Context Provider Component
export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const adminEmail =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() ||
    "sushantratnasingh@gmail.com";
  const isAdmin = Boolean(user?.email?.toLowerCase() === adminEmail);

  // Initialize user session from localStorage token
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
          // Fetch user data using token
          await fetchUserData(storedToken);
        }
      } catch (err) {
        setError("Failed to initialize session");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Fetch user data using token
  const fetchUserData = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/user/getuser`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));

        // If auth failed, clear stored token and redirect to login
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          setToken(null);
          setIsAuthenticated(false);
          router.push("/login");
          return; // Exit without throwing error
        }

        const message =
          body?.message ||
          `Failed to fetch user data (status ${response.status})`;
        throw new Error(message);
      }

      const userData = await response.json();
      console.log("user data fetched:", userData);
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
    }
  };

  // Login function
  const login = async (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("token", authToken);
    setError(null);

    if (!userData) {
      await fetchUserData(authToken);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    setError(null);
    router.push("/login");
  };

  // Update user profile
  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    token,
    login,
    logout,
    updateUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};
