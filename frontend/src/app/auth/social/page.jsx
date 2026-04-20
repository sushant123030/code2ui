"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppContext } from "../../../context/AppContext";

const SocialAuth = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAppContext();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error(`Authentication failed: ${error}`);
      router.replace("/login");
      return;
    }

    if (token) {
      login(token, null);
      toast.success("Login successful!");
      router.replace("/user/generator/default");
      return;
    }

    router.replace("/login");
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a0a2e] to-[#0f0f23] flex items-center justify-center text-white px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-4 gradient-text">
          Processing login…
        </h1>
        <p className="text-gray-300">
          Redirecting you into the app. If this takes too long, refresh or try
          again.
        </p>
      </div>
    </div>
  );
};

const SocialAuthPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SocialAuth />
  </Suspense>
);

export default SocialAuthPage;
