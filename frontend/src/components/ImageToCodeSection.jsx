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

  return `${baseComment}<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Generated UI</title>\n    <style>\n      body { margin: 0; min-height: 100vh; background: #0D0D0D; color: #FFFFFF; font-family: Inter, sans-serif; }\n      .panel { width: min(94vw, 900px); margin: 64px auto; background: #1A1A1A; border: 1px solid #333333; border-radius: 28px; box-shadow: 0 30px 70px rgba(79, 140, 255, 0.15); padding: 40px; }\n      .panel h1 { margin: 0 0 18px; font-size: 2.5rem; }\n      .panel p { color: #B3B3B3; line-height: 1.7; }\n    </style>\n  </head>\n  <body>\n    <div class=\"panel\">\n      <h1>Generated UI from Image</h1>\n      <p>This preview is a placeholder for the generated layout based on your uploaded design.</p>\n    </div>\n  </body>\n</html>\n`;
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

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;background:#0D0D0D;color:#FFFFFF;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;} .placeholder{max-width:640px;padding:30px;border:1px solid #333333;border-radius:24px;background:#121212;text-align:center;} .placeholder h2{color:#FFFFFF;margin-bottom:12px;} .placeholder p{color:#B3B3B3;line-height:1.8;}</style></head><body><div class="placeholder"><h2>Preview for ${format.toUpperCase()} output</h2><p>Code preview is visible in the editor panel. Generated React and Tailwind code cannot render directly in the iframe preview, but you can copy or download it to use in your project.</p></div></body></html>`;
}

const ImageToCodeSection = () => {
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
    <section className="py-24 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-green-primary mb-3">
            Image to Code
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">
            Upload a design, then generate production-ready UI code.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary leading-relaxed">
            Convert sketches, screenshots, or mockups into HTML, React, or
            Tailwind code with a single upload.
          </p>
        </div>

        <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card variant="default" className="p-6">
              <div
                className={`border-2 rounded-3xl border-dashed transition-colors duration-300 ${
                  dragActive
                    ? "border-green-primary bg-[#121212]"
                    : "border-[#333333] bg-[#141414]"
                }`}
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
                <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center">
                  <FiUpload className="h-12 w-12 text-green-primary" />
                  <div>
                    <p className="text-lg font-semibold text-white">
                      Drag & drop your image here
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      PNG, JPG, WEBP, or GIF. Max 5 MB.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose file
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
                <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-[#333333] bg-[#141414] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">
                        Uploaded file
                      </p>
                      <p className="font-semibold text-white">
                        {imageFile.name}
                      </p>
                    </div>
                    <div className="text-sm text-text-secondary">
                      {formatFileSize(imageFile.size)} • {imageFile.type}
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="overflow-hidden rounded-3xl border border-[#333333] bg-[#0D0D0D]">
                      <img
                        src={imagePreview}
                        alt="Upload preview"
                        className="w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] items-center">
                <div className="rounded-3xl border border-[#333333] bg-[#141414] p-4">
                  <label className="block text-sm font-medium text-text-secondary">
                    Output format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#333333] bg-[#0D0D0D] px-4 py-3 text-white outline-none transition focus:border-green-primary"
                  >
                    <option value="html">HTML / CSS</option>
                    <option value="react">React</option>
                    <option value="tailwind">Tailwind</option>
                  </select>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <FiLoader className="animate-spin" /> Processing
                    </span>
                  ) : (
                    "Generate Code"
                  )}
                </Button>
              </div>

              {(error || success) && (
                <div
                  className={`rounded-3xl border px-4 py-3 text-sm ${error ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-green-primary/30 bg-green-primary/10 text-white"}`}
                >
                  <div className="flex items-center gap-2">
                    {error ? <FiAlertTriangle /> : <FiCopy />}
                    <span>{error || success}</span>
                  </div>
                </div>
              )}
            </Card>

            <Card variant="elevated" className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Generated code
                    </h3>
                    <p className="text-text-secondary text-sm">
                      Review and copy the generated UI output.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyCode}
                      disabled={!generatedCode}
                    >
                      <FiCopy /> Copy Code
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDownloadCode}
                      disabled={!generatedCode}
                    >
                      <FiDownload /> Download
                    </Button>
                  </div>
                </div>

                <div className="h-[420px] overflow-hidden rounded-3xl border border-[#333333] bg-[#0D0D0D]">
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

          <Card variant="default" className="p-6">
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-primary/10 text-green-primary">
                    <FiImage className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Live preview
                    </h3>
                    <p className="text-text-secondary text-sm">
                      See how the generated interface will look in a rendered
                      preview.
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-[#333333] bg-[#0D0D0D]">
                  <iframe
                    title="image-to-code-preview"
                    className="h-[560px] w-full bg-[#0D0D0D]"
                    sandbox="allow-scripts allow-same-origin"
                    srcDoc={previewHTML}
                  />
                </div>
              </div>

              <div className="grid gap-3 rounded-3xl border border-[#333333] bg-[#141414] p-4">
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <span>Preview status</span>
                  <span>{generatedCode ? "Ready" : "Awaiting code"}</span>
                </div>
                <div className="rounded-2xl bg-[#0D0D0D] p-4 text-sm leading-6 text-text-secondary">
                  {generatedCode ? (
                    <p>Preview is rendering the latest generated output.</p>
                  ) : (
                    <p>
                      Upload an image and generate code to populate the preview
                      automatically.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ImageToCodeSection;
