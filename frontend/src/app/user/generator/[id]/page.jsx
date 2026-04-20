"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";

const DEFAULT_PREVIEW = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body style="margin: 0; padding: 0; background: #f5f5f5; display: flex; align-items: center; justify-content: center; height: 100vh;">
    <div style="text-align: center; color: #999;">
        <p style="font-size: 14px;">Enter a prompt and generate to see preview</p>
    </div>
</body>
</html>`;

// Function to wrap content in proper HTML structure
function wrapInHTML(content) {
  if (!content || !content.trim()) {
    return DEFAULT_PREVIEW;
  }

  const trimmed = content.trim();

  // If it's already a complete HTML document
  if (
    trimmed.includes("<!DOCTYPE html>") ||
    (trimmed.includes("<html") && trimmed.includes("</html>"))
  ) {
    return trimmed;
  }

  // If it starts with HTML tag
  if (trimmed.startsWith("<html")) {
    return `<!DOCTYPE html>\n${trimmed}`;
  }

  // If it contains body tag but no html tag
  if (trimmed.includes("<body") && !trimmed.includes("<html")) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; padding: 0; min-height: 100vh; }
      * { box-sizing: border-box; }
    </style>
</head>
${trimmed}
</html>`;
  }

  // Default: wrap content in body tags
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; padding: 0; min-height: 100vh; }
      * { box-sizing: border-box; }
    </style>
</head>
<body>
    ${trimmed}
</body>
</html>`;
}

// Function to detect language
function detectLanguage(code) {
  const trimmed = code.trim();
  if (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    trimmed.includes("<body")
  ) {
    return "html";
  } else if (
    trimmed.includes("function") ||
    trimmed.includes("const") ||
    trimmed.includes("let") ||
    trimmed.includes("var") ||
    trimmed.includes("class")
  ) {
    return "javascript";
  } else {
    return "html"; // default
  }
}

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState(DEFAULT_PREVIEW);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fullscreenEditor, setFullscreenEditor] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState("desktop");

  const [isCreatingLivePreview, setIsCreatingLivePreview] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState("");

  const iframeRef = useRef(null);
  const { id } = useParams();

  // Fetch existing project data on mount
  useEffect(() => {
    if (!id) return;

    const fetchProjectData = async () => {
      // Check if id is a valid MongoDB ObjectId (24 hex characters)
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        console.log("Invalid project ID, starting with empty project");
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/project/getbyid/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        setPrompt(response.data.prompt || "");
        const projectCode = response.data.code || "";
        setCode(projectCode);
        if (projectCode && projectCode.includes("<!DOCTYPE")) {
          setPreview(projectCode);
        } else {
          setPreview(DEFAULT_PREVIEW);
        }
      } catch (err) {
        console.error(err);
        // Don't show error for invalid IDs - just use default values
        if (err.response?.status !== 400) {
          setError("Failed to load project");
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProjectData();
  }, [id]);

  useEffect(() => setError(null), [prompt]);

  // Update iframe content when preview changes
  useEffect(() => {
    if (iframeRef.current) {
      setIsPreviewLoading(true);

      const htmlContent = wrapInHTML(preview);
      iframeRef.current.srcDoc = htmlContent;

      // Simulate loading time for better UX
      setTimeout(() => setIsPreviewLoading(false), 500);
    }
  }, [preview]);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please enter a prompt to generate UI");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCode("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/project/generate-and-save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ prompt: trimmed, projectId: id }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          `API request failed with status ${response.status}`;
        setError(errorMessage);
        setCode("");
        setPreview(DEFAULT_PREVIEW);
        return;
      }

      const data = await response.json();
      const generatedCode =
        typeof data === "string" ? data : data?.html || data?.code || "";

      if (!generatedCode.trim()) {
        setError("No valid code returned from API");
        setCode("");
        setPreview(DEFAULT_PREVIEW);
        return;
      }

      setCode(generatedCode);
      setPreview(generatedCode);
      setSuccessMessage("Code generated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate UI. Please try again.");
      setCode("");
      setPreview(DEFAULT_PREVIEW);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCode = async () => {
    if (!code.trim()) {
      setError("Code cannot be empty.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/project/update-code`,
        { projectId: id, code },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setSuccessMessage("Code saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to save code.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshPreview = () => {
    if (code.trim()) {
      setIsPreviewLoading(true);
      setPreview(code);
      setSuccessMessage("Preview refreshed!");
      setTimeout(() => {
        setSuccessMessage("");
        setIsPreviewLoading(false);
      }, 2000);
    }
  };

  const resetAll = () => {
    setPrompt("");
    setCode("");
    setPreview(DEFAULT_PREVIEW);
    setLivePreviewUrl("");
    setError(null);
    setSuccessMessage("");
    setIsCopied(false);
  };

  const handleCopyCode = async () => {
    if (!code.trim()) {
      setError("Code cannot be empty.");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setSuccessMessage("Code copied to clipboard!");
      setTimeout(() => {
        setIsCopied(false);
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to copy code.");
    }
  };

  const handleExportPreview = () => {
    if (!code.trim()) {
      setError("No code to export.");
      return;
    }

    const htmlContent = wrapInHTML(code);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preview-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccessMessage("Preview exported successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleGoLive = async () => {
    if (!code.trim()) {
      setError("No code to go live.");
      return;
    }

    setIsCreatingLivePreview(true);
    setError(null);

    try {
      // First, ensure the code is saved to the project
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/project/update-code`,
        { projectId: id, code },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      // Generate the live preview URL
      const liveUrl = `${process.env.NEXT_PUBLIC_API_URL}/project/live/${id}`;
      setLivePreviewUrl(liveUrl);

      // Copy to clipboard
      await navigator.clipboard.writeText(liveUrl);

      setSuccessMessage(
        livePreviewUrl
          ? "Live preview updated and URL copied!"
          : "Live preview URL created and copied to clipboard!",
      );
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error(err);
      setError("Failed to create live preview.");
    } finally {
      setIsCreatingLivePreview(false);
    }
  };

  if (fullscreenEditor) {
    return (
      <div className="fixed inset-0 bg-bg-primary z-50 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-bg-secondary border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">Code Editor</h2>
          <button
            onClick={() => setFullscreenEditor(false)}
            className="px-4 py-2 bg-bg-elevated hover:bg-bg-secondary rounded-lg border border-border-color text-text-primary transition-all duration-300"
          >
            Exit Fullscreen
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={detectLanguage(code)}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              lineNumbers: "on",
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16 },
              cursorBlinking: "smooth",
            }}
          />
        </div>
      </div>
    );
  }

  if (fullscreenPreview) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-bg-secondary border-b border-border-color flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-text-primary">Preview</h2>
            {livePreviewUrl && (
              <div className="flex items-center gap-2">
                <span className="text-green-primary text-sm">Live:</span>
                <button
                  onClick={() => window.open(livePreviewUrl, "_blank")}
                  className="text-sm px-3 py-1 bg-green-secondary hover:bg-green-primary rounded-lg text-bg-primary transition-all duration-300"
                >
                  Open Live Preview
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                  previewMode === "desktop"
                    ? "bg-green-secondary text-bg-primary"
                    : "bg-bg-secondary text-text-secondary hover:bg-bg-elevated"
                }`}
              >
                🖥️ Desktop
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                  previewMode === "mobile"
                    ? "bg-green-secondary text-bg-primary"
                    : "bg-bg-secondary text-text-secondary hover:bg-bg-elevated"
                }`}
              >
                📱 Mobile
              </button>
              <button
                onClick={() => setPreviewMode("tablet")}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                  previewMode === "tablet"
                    ? "bg-green-secondary text-bg-primary"
                    : "bg-bg-secondary text-text-secondary hover:bg-bg-elevated"
                }`}
              >
                📱 Tablet
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefreshPreview}
              className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all duration-300"
              title="Refresh Preview"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleGoLive}
              disabled={isCreatingLivePreview}
              className="text-sm px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-all duration-300 disabled:opacity-50"
              title="Create Live Preview URL"
            >
              {isCreatingLivePreview ? "🔗..." : "🔗 Go Live"}
            </button>
            <button
              onClick={handleExportPreview}
              className="text-sm px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-all duration-300"
              title="Export as HTML"
            >
              💾 Export
            </button>
            <button
              onClick={() => setFullscreenPreview(false)}
              className="px-4 py-2 bg-bg-elevated hover:bg-bg-secondary rounded-lg border border-border-color text-text-primary transition-all duration-300"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {isPreviewLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-green-secondary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-text-secondary">Loading preview...</span>
              </div>
            </div>
          )}
          <div
            className={`h-full flex justify-center items-start pt-8 ${previewMode !== "desktop" ? "bg-gray-100" : "bg-white"}`}
          >
            <iframe
              key={`fullscreen-preview-${previewMode}`}
              title="fullscreen-preview"
              className="border border-gray-300 rounded-lg shadow-lg bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-presentation"
              srcDoc={preview}
              style={{
                display: "block",
                width:
                  previewMode === "mobile"
                    ? "375px"
                    : previewMode === "tablet"
                      ? "768px"
                      : "90vw",
                height:
                  previewMode === "mobile"
                    ? "667px"
                    : previewMode === "tablet"
                      ? "1024px"
                      : "90vh",
                maxWidth: "100%",
                maxHeight: "100%",
                transition: "all 0.3s ease",
              }}
              onLoad={() => setIsPreviewLoading(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-elevated text-text-primary">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="inline-block mb-4 px-4 py-2 rounded-full bg-green-primary/10 border border-green-primary/30 backdrop-blur-sm">
            <span className="text-sm uppercase tracking-[0.3em] text-green-primary font-semibold">
              ✨ Code Generator
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            Create stunning UIs with
            <span className="block bg-gradient-to-r from-green-primary via-green-secondary to-green-primary bg-clip-text text-transparent">
              {" "}
              AI-powered code generation
            </span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mt-4">
            Describe your design vision, generate optimized code, and preview in
            real-time across all devices.
          </p>
        </motion.div>

        <div className="mb-8 rounded-3xl border border-green-primary/20 bg-gradient-to-r from-green-primary/5 to-green-secondary/5 p-6 shadow-lg">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            className="w-full p-5 bg-[#0D0D0D] rounded-2xl text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-green-primary/50 border border-green-primary/20 resize-none font-medium"
            placeholder="✨ Describe your perfect UI design here. Be as detailed as you want!"
            rows="4"
          />
          <p className="text-xs text-text-secondary mt-3 font-medium">
            💡 Tip: More detailed descriptions generate better code.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row flex-wrap gap-4 mt-6">
          <div className="flex flex-wrap gap-3 w-full">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-green-primary to-green-secondary hover:from-green-secondary hover:to-green-primary rounded-xl font-bold text-white shadow-lg shadow-green-primary/40 hover:shadow-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Generating…
                </span>
              ) : (
                "🚀 Generate Code"
              )}
            </button>
            <button
              onClick={handleRefreshPreview}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-blue-600/40 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🔄 Refresh Preview
            </button>
            <button
              onClick={resetAll}
              className="px-6 py-3 bg-bg-secondary hover:bg-bg-elevated rounded-xl border-2 border-border-color text-white font-bold transition-all duration-300 transform hover:scale-105"
            >
              ↻ Reset All
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-2xl border-2 border-red-500/50 bg-red-500/10 text-red-200 font-medium flex items-center gap-2"
          >
            <span>⚠️</span> {error}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-2xl border-2 border-green-primary/50 bg-green-primary/10 text-green-200 font-medium flex items-center gap-2"
          >
            <span>✅</span> {successMessage}
          </motion.div>
        )}

        {livePreviewUrl && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 rounded-3xl border-2 border-green-primary/50 bg-gradient-to-r from-green-primary/10 to-green-secondary/10 shadow-lg shadow-green-primary/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🔗</span>
              <h3 className="text-xl font-bold text-green-200">
                Live Preview Ready!
              </h3>
              <button
                onClick={() => window.open(livePreviewUrl, "_blank")}
                className="ml-auto px-4 py-2 bg-green-primary hover:bg-green-secondary rounded-lg text-[#0D0D0D] font-bold transition-all duration-300 transform hover:scale-105"
              >
                Open Link ↗️
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={livePreviewUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-[#0D0D0D] rounded-lg text-green-200 text-sm border-2 border-green-primary/30 font-mono"
              />
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(livePreviewUrl);
                  setSuccessMessage("URL copied to clipboard!");
                  setTimeout(() => setSuccessMessage(""), 2000);
                }}
                className="px-4 py-2 bg-green-primary/20 hover:bg-green-primary/30 rounded-lg border-2 border-green-primary/50 text-green-200 font-bold transition-all duration-300"
              >
                Copy 📋
              </button>
            </div>
          </motion.div>
        )}

        {/* Code Editor & Preview - Side by Side */}
        <div className="mt-12 grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  📝 Code Editor
                </h2>
                <p className="text-text-secondary text-sm mt-2">
                  Edit or refine your generated code before previewing.
                </p>
              </div>
              <button
                onClick={() => setFullscreenEditor(true)}
                className="px-4 py-2 bg-green-primary/20 hover:bg-green-primary/30 rounded-lg text-green-200 font-bold border-2 border-green-primary/50 transition-all duration-300"
              >
                ⛶ Fullscreen
              </button>
            </div>

            <div className="rounded-3xl border-2 border-green-primary/30 bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] shadow-2xl shadow-green-primary/10 overflow-hidden">
              <Editor
                height="550px"
                language={detectLanguage(code)}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  smoothScrolling: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16 },
                  cursorBlinking: "smooth",
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveCode}
                disabled={isSaving}
                className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-green-primary to-green-secondary hover:from-green-secondary hover:to-green-primary text-white shadow-lg shadow-green-primary/40 disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving…
                  </span>
                ) : (
                  "💾 Save Code"
                )}
              </button>
              <button
                onClick={handleCopyCode}
                className="px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 transition-all duration-300 transform hover:scale-105"
              >
                {isCopied ? "✓ Copied!" : "📋 Copy Code"}
              </button>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  👁️ Live Preview
                </h2>
                <p className="text-text-secondary text-sm mt-2">
                  View your design across different screen sizes.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                    previewMode === "desktop"
                      ? "bg-green-primary text-[#0D0D0D] shadow-lg shadow-green-primary/40"
                      : "bg-bg-secondary text-text-secondary hover:bg-bg-elevated border border-border-color"
                  }`}
                >
                  🖥️ Desktop
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                    previewMode === "mobile"
                      ? "bg-green-primary text-[#0D0D0D] shadow-lg shadow-green-primary/40"
                      : "bg-bg-secondary text-text-secondary hover:bg-bg-elevated border border-border-color"
                  }`}
                >
                  📱 Mobile
                </button>
                <button
                  onClick={() => setPreviewMode("tablet")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                    previewMode === "tablet"
                      ? "bg-green-primary text-[#0D0D0D] shadow-lg shadow-green-primary/40"
                      : "bg-bg-secondary text-text-secondary hover:bg-bg-elevated border border-border-color"
                  }`}
                >
                  📱 Tablet
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRefreshPreview}
                className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold transition-all duration-300 transform hover:scale-105"
                title="Refresh Preview"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleGoLive}
                disabled={isCreatingLivePreview}
                className="text-sm px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                title="Create Live Preview URL"
              >
                {isCreatingLivePreview ? "🔗..." : "🔗 Go Live"}
              </button>
              <button
                onClick={handleExportPreview}
                className="text-sm px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold transition-all duration-300 transform hover:scale-105"
                title="Export as HTML"
              >
                ⬇️ Export
              </button>
              <button
                onClick={() => setFullscreenPreview(true)}
                className="text-sm px-4 py-2 bg-green-primary hover:bg-green-secondary rounded-lg text-[#0D0D0D] font-bold transition-all duration-300 transform hover:scale-105"
              >
                ⛶ Fullscreen
              </button>
            </div>

            <div className="rounded-3xl border-2 border-green-primary/30 bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] shadow-2xl shadow-green-primary/10 overflow-hidden relative">
              {isPreviewLoading && (
                <div className="absolute inset-0 bg-[#0D0D0D] bg-opacity-80 flex items-center justify-center z-10 rounded-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-green-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-green-200 font-bold">
                      Loading preview...
                    </span>
                  </div>
                </div>
              )}

              <div
                className={`flex justify-center p-4 ${
                  previewMode !== "desktop" ? "bg-gray-100" : "bg-white"
                }`}
              >
                <iframe
                  key={`preview-iframe-${previewMode}`}
                  ref={iframeRef}
                  title="preview"
                  className="border-4 border-green-primary/30 rounded-2xl shadow-xl bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-presentation"
                  srcDoc={preview}
                  style={{
                    display: "block",
                    width:
                      previewMode === "mobile"
                        ? "375px"
                        : previewMode === "tablet"
                          ? "768px"
                          : "100%",
                    height:
                      previewMode === "mobile"
                        ? "667px"
                        : previewMode === "tablet"
                          ? "1024px"
                          : "520px",
                    maxWidth: "100%",
                    transition: "all 0.3s ease",
                  }}
                  onLoad={() => setIsPreviewLoading(false)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
