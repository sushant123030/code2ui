"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  FiUpload,
  FiCopy,
  FiDownload,
  FiImage,
  FiLoader,
  FiAlertTriangle,
} from "react-icons/fi";
import Button from "./Button";
import Card from "./Card";
import { generateFromImage } from "../lib/imageToCodeService";

const SUPPORTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFallbackCode(format, fileName) {
  const baseComment = `<!-- Generated UI from ${fileName} -->\n`;

  if (format === "react") {
    return `import React from \"react\";\n\nexport default function GeneratedUI() {\n  return (\n    <div className=\"min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-6\">\n      <div className=\"max-w-3xl w-full rounded-[28px] border border-[#333333] bg-[#1A1A1A] p-8 shadow-[0_30px_70px_rgba(79,140,255,0.15)]\">\n        <h1 className=\"text-3xl font-semibold mb-4 text-white\">Generated UI</h1>\n        <p className=\"text-text-secondary mb-6\">This interface was generated from your uploaded image.</p>\n        <div className=\"rounded-3xl border border-[#333333] bg-[#262626] p-6\">\n          <h2 className=\"text-xl font-semibold mb-2\">Design preview</h2>\n          <p className=\"text-text-secondary\">Replace this component with your real generated layout.</p>\n        </div>\n      </div>\n    </div>\n  );\n}\n`;
  }

  if (format === "tailwind") {
    return `${baseComment}<div class=\"min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-6\">\n  <div class=\"max-w-3xl w-full rounded-[28px] border border-[#333333] bg-[#1A1A1A] p-8 shadow-[0_30px_70px_rgba(79,140,255,0.15)]\">\n    <h1 class=\"text-3xl font-semibold mb-4 text-white\">Generated Tailwind UI</h1>\n    <p class=\"text-text-secondary mb-6\">This layout uses Tailwind classes generated from your image.</p>\n  </div>\n</div>\n`;
  }

  return `${baseComment}<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Generated UI</title>\n    <style>body{margin:0;min-height:100vh;background:#0D0D0D;color:#FFFFFF;font-family:Inter,sans-serif;}</style>\n  </head>\n  <body>\n    <div style=\"padding:32px;max-width:900px;margin:0 auto;\">\n      <h1 style=\"color:#FFFFFF;font-size:2.25rem;margin-bottom:16px;\">Generated UI from Image</h1>\n      <p style=\"color:#B3B3B3;line-height:1.7;\">This placeholder HTML was generated from your uploaded image.</p>\n    </div>\n  </body>\n</html>`;
}

function getPreviewHtml(code, format) {
  if (!code) {
    return `<!DOCTYPE html><html><body style=\"background:#0D0D0D;color:#FFFFFF;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;\"><div style=\"text-align:center;max-width:420px;padding:24px;\"><h2 style=\"color:#FFFFFF;\">Upload an image and generate code to preview it here.</h2></div></body></html>`;
  }

  if (format === "html") {
    return code.trim().startsWith("<!DOCTYPE")
      ? code
      : `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><style>body{margin:0;background:#0D0D0D;color:#FFFFFF;font-family:Inter,sans-serif;} .preview-shell{padding:32px;}</style></head><body><div class=\"preview-shell\">${code}</div></body></html>`;
  }

  return `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><style>body{margin:0;background:#0D0D0D;color:#FFFFFF;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;} .placeholder{max-width:640px;padding:30px;border:1px solid #333333;border-radius:24px;background:#121212;text-align:center;} .placeholder h2{color:#FFFFFF;margin-bottom:12px;} .placeholder p{color:#B3B3B3;line-height:1.8;}</style></head><body><div class=\"placeholder\"><h2>Preview for ${format.toUpperCase()} output</h2><p>Code preview is visible in the editor panel. Generated React and Tailwind code cannot render directly in the iframe preview, but you can copy or download it to use in your project.</p></div></body></html>`;
}

const ProjectSection = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [outputFormat, setOutputFormat] = useState("html");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(""), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const handleFile = (file) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError("Unsupported image type. Please upload PNG, JPG, WEBP, or GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large. Please upload a file under 5 MB.");
      return;
    }

    setError("");
    setGeneratedCode("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSelectFile = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      setError("Please upload an image to generate code.");
      return;
    }

    setError("");
    setIsLoading(true);
    setGeneratedCode("");

    try {
      const data = await generateFromImage(
        imageFile,
        outputFormat,
        localStorage.getItem("token"),
      );

      const outputCode =
        data?.code ||
        data?.html ||
        data?.react ||
        data?.tailwind ||
        getFallbackCode(outputFormat, imageFile.name);
      setGeneratedCode(outputCode);
      setSuccess("Code generated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate code from the image.");
      setGeneratedCode(
        getFallbackCode(outputFormat, imageFile.name || "uploaded-image"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setSuccess("Code copied to clipboard.");
    } catch (err) {
      console.error(err);
      setError("Unable to copy code.");
    }
  };

  const handleDownloadCode = () => {
    if (!generatedCode) return;
    const extension =
      outputFormat === "react"
        ? "jsx"
        : outputFormat === "tailwind"
          ? "html"
          : "html";
    const fileName = `generated-ui.${extension}`;
    const blob = new Blob([generatedCode], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const previewHTML = useMemo(
    () => getPreviewHtml(generatedCode, outputFormat),
    [generatedCode, outputFormat],
  );

  return (
    <section className="relative py-24 bg-gradient-to-b from-[#0D0D0D] via-[#111111] to-[#0A0A0A] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16 text-center">
          <div className="inline-block mb-4 px-4 py-2 rounded-full bg-green-primary/10 border border-green-primary/30 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-green-primary font-semibold">
              🚀 Project Builder
            </p>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Build your next UI project
            <span className="block bg-gradient-to-r from-green-primary to-green-secondary bg-clip-text text-transparent">
              from an image upload
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-text-secondary text-lg leading-relaxed">
            Upload a screenshot or mockup and instantly generate
            production-ready HTML, React, or Tailwind code.
          </p>
        </div>

        <div className="grid gap-12 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <Card
              variant="elevated"
              className="p-8 border border-green-primary/20 shadow-2xl"
            >
              <div
                className={`border-2 rounded-3xl border-dashed transition-all duration-300 ${
                  dragActive
                    ? "border-green-primary bg-green-primary/5 shadow-lg shadow-green-primary/20"
                    : "border-[#333333] bg-gradient-to-br from-[#1A1A1A] to-[#141414]"
                } hover:border-green-primary/50 cursor-pointer`}
                onDrop={handleDrop}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                }}
              >
                <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-5 p-12 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-primary/20 blur-xl rounded-full"></div>
                    <FiUpload className="h-16 w-16 text-green-primary relative" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">
                      Drag & drop your design
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      PNG, JPG, WEBP, or GIF (Max 5 MB)
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleSelectFile}
                  />
                </label>
              </div>

              {imageFile && (
                <div className="mt-8 flex flex-col gap-6 rounded-3xl border border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-transparent p-6 shadow-lg">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-green-primary font-semibold">
                        File Details
                      </p>
                      <p className="font-bold text-white text-lg mt-1">
                        {imageFile.name}
                      </p>
                    </div>
                    <div className="text-sm text-text-secondary bg-[#1A1A1A] px-4 py-2 rounded-full">
                      {formatFileSize(imageFile.size)} • {imageFile.type}
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="overflow-hidden rounded-3xl border-2 border-green-primary/30 bg-[#0D0D0D] shadow-xl">
                      <img
                        src={imagePreview}
                        alt="Upload preview"
                        className="w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-2xl bg-gradient-to-r from-[#1A1A1A] to-[#0F0F0F] p-6 border border-[#333333]">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-full rounded-xl border-2 border-green-primary/30 bg-[#0D0D0D] px-4 py-3 text-white font-medium outline-none transition focus:border-green-primary focus:shadow-lg focus:shadow-green-primary/20"
                  >
                    <option value="html">🎨 HTML / CSS</option>
                    <option value="react">⚛️ React</option>
                    <option value="tailwind">🌊 Tailwind CSS</option>
                  </select>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="shadow-lg shadow-green-primary/30"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <FiLoader className="animate-spin" /> Generating
                    </span>
                  ) : (
                    "Generate Code"
                  )}
                </Button>
              </div>

              {(error || success) && (
                <div
                  className={`rounded-2xl border-2 px-5 py-4 text-sm font-medium transition-all ${
                    error
                      ? "border-red-500/40 bg-red-500/10 text-red-200"
                      : "border-green-primary/40 bg-green-primary/10 text-green-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {error ? (
                      <FiAlertTriangle className="h-5 w-5" />
                    ) : (
                      <FiCopy className="h-5 w-5" />
                    )}
                    <span>{error || success}</span>
                  </div>
                </div>
              )}
            </Card>

            <Card
              variant="elevated"
              className="p-8 border border-green-primary/20 shadow-2xl"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Generated Code
                    </h3>
                    <p className="text-text-secondary text-sm mt-2">
                      Review, copy, or download your generated UI code.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyCode}
                      disabled={!generatedCode}
                      className="hover:shadow-lg"
                    >
                      <FiCopy /> Copy
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDownloadCode}
                      disabled={!generatedCode}
                      className="hover:shadow-lg"
                    >
                      <FiDownload /> Download
                    </Button>
                  </div>
                </div>

                <div className="h-[480px] overflow-hidden rounded-3xl border-2 border-green-primary/20 bg-[#0D0D0D] shadow-2xl">
                  <Editor
                    height="100%"
                    language={outputFormat === "react" ? "javascript" : "html"}
                    theme="vs-dark"
                    value={
                      generatedCode || "// Generate code to display it here..."
                    }
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      lineNumbers: "on",
                      readOnly: true,
                      wordWrap: "on",
                      wrappingIndent: "indent",
                      smoothScrolling: true,
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>

          <Card
            variant="default"
            className="p-8 border border-green-primary/20 shadow-2xl h-fit sticky top-8"
          >
            <div className="flex flex-col gap-8">
              <div>
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-primary/20 to-green-secondary/20 border border-green-primary/30">
                    <FiImage className="h-7 w-7 text-green-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Live Preview
                    </h3>
                    <p className="text-text-secondary text-sm mt-1">
                      See your design in action
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border-2 border-green-primary/20 bg-[#0A0A0A] sm:bg-[#121212] md:bg-[#151515] lg:bg-[#1A1A1A] shadow-2xl shadow-green-primary/10">
                  <iframe
                    title="project-preview"
                    className="h-[560px] w-full bg-[#0A0A0A] sm:bg-[#121212] md:bg-[#151515] lg:bg-[#1A1A1A]"
                    sandbox="allow-scripts allow-same-origin"
                    srcDoc={previewHTML}
                  />
                </div>
              </div>

              <div className="rounded-2xl border-2 border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-transparent p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-white">
                    Status
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      generatedCode
                        ? "bg-green-primary/20 text-green-300 border border-green-primary/50"
                        : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                    }`}
                  >
                    {generatedCode ? "✓ Ready" : "⏳ Awaiting"}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {generatedCode
                    ? "Your design preview is rendering. Copy or download the code to use in your project."
                    : "Upload an image and click Generate Code to see your live preview."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProjectSection;
