"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "./Tool.module.css";

// Dynamically import the PDF preview to avoid SSR issues with canvas
const PdfPagePreview = dynamic(() => import("@/components/PdfPagePreview"), {
  ssr: false,
});

// Tool configurations with proper descriptions and settings
const toolConfig: Record<string, {
  title: string;
  description: string;
  acceptType: string;
  allowMultiple: boolean;
  defaultOutput: string;
  needsPassword?: boolean;
  needsPages?: boolean;
  needsRotation?: boolean;
  needsPagePreview?: boolean;
  pagesLabel?: string;
  pagesPlaceholder?: string;
}> = {
  "merge-pdf": {
    title: "Merge PDF",
    description: "Combine multiple PDF files into a single document.",
    acceptType: ".pdf",
    allowMultiple: true,
    defaultOutput: "merged.pdf",
  },
  "image-to-pdf": {
    title: "Image to PDF",
    description: "Convert your images (JPG, PNG) into a PDF document.",
    acceptType: "image/jpeg, image/png, image/jpg",
    allowMultiple: true,
    defaultOutput: "images.pdf",
  },
  "split-pdf": {
    title: "Split PDF",
    description: "Extract specific pages from your PDF document.",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "split.pdf",
    needsPages: true,
    pagesLabel: "Pages to Extract",
    pagesPlaceholder: "e.g. 1,3,5-8",
  },
  "rotate-pdf": {
    title: "Rotate PDF",
    description: "Rotate all pages of your PDF by a specified angle.",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "rotated.pdf",
    needsRotation: true,
  },
  "lock-pdf": {
    title: "Lock PDF",
    description: "Protect your PDF with a password to prevent unauthorized access.",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "locked.pdf",
    needsPassword: true,
  },
  "unlock-pdf": {
    title: "Unlock PDF",
    description: "Remove password protection from your PDF.",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "unlocked.pdf",
    needsPassword: true,
  },
  "delete-pages": {
    title: "Delete PDF Pages",
    description: "Select and remove specific pages from your PDF document.",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "pages_deleted.pdf",
    needsPagePreview: true,
  },
  "analyse-pdf": {
    title: "Analyse PDF",
    description: "Get detailed metadata and information about your PDF.",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "",
  },
  "compress-image": {
    title: "Compress Image",
    description: "Reduce image file size while maintaining quality.",
    acceptType: "image/jpeg, image/png, image/jpg",
    allowMultiple: true,
    defaultOutput: "compressed.zip",
  },
  "crop-pdf": {
    title: "Crop PDF",
    description: "Trim margins and adjust the page size of your PDF.",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "cropped.pdf",
  },
};

export default function ToolPage() {
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [outputName, setOutputName] = useState("");
  const [password, setPassword] = useState("");
  const [pages, setPages] = useState("");
  const [rotation, setRotation] = useState("90");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [analysisData, setAnalysisData] = useState<any>(null);

  // For page preview (delete-pages)
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [totalPageCount, setTotalPageCount] = useState(0);

  const config = toolConfig[id];
  const isSupported = !!config;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      // Reset page selection when new file is added
      if (config?.needsPagePreview) {
        setSelectedPages(new Set());
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
      if (config?.needsPagePreview) {
        setSelectedPages(new Set());
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (config?.needsPagePreview) {
      setSelectedPages(new Set());
    }
  };

  const handleTogglePage = useCallback((pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    // We'll get totalPageCount from the preview component
    // For now, generate all page numbers
    setSelectedPages((prev) => {
      // If we don't know totalPageCount yet, do nothing
      if (totalPageCount === 0) return prev;
      const all = new Set<number>();
      for (let i = 1; i <= totalPageCount; i++) {
        all.add(i);
      }
      return all;
    });
  }, [totalPageCount]);

  const handleDeselectAll = useCallback(() => {
    setSelectedPages(new Set());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAnalysisData(null);

    if (files.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    if (id === "merge-pdf" && files.length < 2) {
      setError("Please select at least two PDF files to merge.");
      return;
    }

    // For page preview tools, use selected pages
    if (config?.needsPagePreview && selectedPages.size === 0) {
      setError("Please select at least one page to delete by clicking on the page thumbnails.");
      return;
    }

    if (config?.needsPages && !pages.trim()) {
      setError(`Please specify the page numbers to ${id === "delete-pages" ? "delete" : "extract"}.`);
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      if (outputName) formData.append("output_name", outputName);
      if (password) formData.append("password", password);
      if (rotation) formData.append("rotation", rotation);

      // For page preview, convert selected pages to pages string
      if (config?.needsPagePreview) {
        const pagesStr = Array.from(selectedPages).sort((a, b) => a - b).join(",");
        formData.append("pages", pagesStr);
      } else if (pages) {
        formData.append("pages", pages);
      }

      const endpointMap: Record<string, string> = {
        "merge-pdf": "/api/pdf/merge",
        "image-to-pdf": "/api/pdf/image-to-pdf",
        "split-pdf": "/api/pdf/split",
        "rotate-pdf": "/api/pdf/rotate",
        "lock-pdf": "/api/pdf/lock",
        "unlock-pdf": "/api/pdf/unlock",
        "delete-pages": "/api/pdf/delete-pages",
        "analyse-pdf": "/api/pdf/analyse",
        "compress-image": "/api/pdf/compress-image",
        "crop-pdf": "/api/pdf/crop",
      };

      const endpoint = endpointMap[id];
      if (!endpoint) {
        throw new Error("This tool is coming soon!");
      }

      files.forEach((file) => formData.append("files", file));

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process files");
      }

      if (id === "analyse-pdf") {
        const data = await response.json();
        setAnalysisData(data.metadata);
        return;
      }

      // Handle download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = outputName || config?.defaultOutput || "output.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  // Track total pages from the preview component
  const handlePreviewLoaded = useCallback((count: number) => {
    setTotalPageCount(count);
  }, []);

  return (
    <main className={styles.main}>
      
      <section className={styles.toolSection}>
        <div className={styles.container}>
          
          <Link href="/tools" className={styles.backLink}>
            &larr; Back to Tools
          </Link>

          <div className={styles.toolHeader}>
            <h1 className={styles.title}>
              {config?.title || id.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
            </h1>
            <p className={styles.subtitle}>
              {config?.description || "Upload your files below to get started securely."}
            </p>
          </div>

          {!isSupported ? (
            <div className={styles.premiumLock}>
              <svg className={styles.premiumIcon} xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <h2>Pro Feature Locked</h2>
              <p>This advanced document processing feature requires the Akshar KITAAB Pro engine.</p>
              <button className={styles.upgradeBtn}>Upgrade to Pro</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.toolForm}>
              
              {/* File Upload Zone */}
              <div 
                className={styles.dropZone}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className={styles.uploadIcon} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <p className={styles.dropText}>Click to browse or drag and drop files here</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className={styles.fileInput}
                  multiple={config?.allowMultiple}
                  accept={config?.acceptType}
                />
              </div>

              {/* File List */}
              {files.length > 0 && !config?.needsPagePreview && (
                <div className={styles.fileList}>
                  <p className={styles.fileListTitle}>Selected Files:</p>
                  <ul>
                    {files.map((f, i) => (
                      <li key={i}>
                        <span>{f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button type="button" onClick={() => removeFile(i)} className={styles.removeFileBtn}>Remove</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* File info + remove for page-preview tools */}
              {files.length > 0 && config?.needsPagePreview && (
                <div className={styles.fileList}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p className={styles.fileListTitle} style={{ marginBottom: 0 }}>
                      {files[0].name} ({(files[0].size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    <button type="button" onClick={() => removeFile(0)} className={styles.removeFileBtn}>Change File</button>
                  </div>
                </div>
              )}

              {/* PDF Page Preview for delete-pages */}
              {files.length > 0 && config?.needsPagePreview && (
                <PdfPagePreview
                  file={files[0]}
                  selectedPages={selectedPages}
                  onTogglePage={handleTogglePage}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onPagesLoaded={handlePreviewLoaded}
                />
              )}

              {/* Page number input for split-pdf */}
              {config?.needsPages && (
                <div className={styles.inputGroup}>
                  <label>{config.pagesLabel}</label>
                  <input 
                    type="text" 
                    value={pages} 
                    onChange={(e) => setPages(e.target.value)} 
                    placeholder={config.pagesPlaceholder}
                    className={styles.textInput}
                    required
                  />
                  <p className={styles.inputHint}>
                    Use commas to separate pages and hyphens for ranges. Example: 1,3,5-8
                  </p>
                </div>
              )}

              {/* Rotation angle for rotate-pdf */}
              {config?.needsRotation && (
                <div className={styles.inputGroup}>
                  <label>Rotation Angle</label>
                  <select 
                    value={rotation} 
                    onChange={(e) => setRotation(e.target.value)}
                    className={styles.textInput}
                  >
                    <option value="90">90° Clockwise</option>
                    <option value="180">180°</option>
                    <option value="270">270° Clockwise (90° Counter-Clockwise)</option>
                  </select>
                </div>
              )}

              {/* Password input for lock/unlock */}
              {config?.needsPassword && (
                <div className={styles.inputGroup}>
                  <label>Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter PDF password"
                    className={styles.textInput}
                    required={id === "lock-pdf"}
                  />
                </div>
              )}

              {/* Output filename for non-analysis tools */}
              {id !== "analyse-pdf" && (
                <div className={styles.inputGroup}>
                  <label>Output File Name (Optional)</label>
                  <input 
                    type="text" 
                    value={outputName} 
                    onChange={(e) => setOutputName(e.target.value)} 
                    placeholder={`e.g. ${config?.defaultOutput?.replace('.pdf', '').replace('.zip', '') || 'final_document'}`}
                    className={styles.textInput}
                  />
                </div>
              )}

              {error && <p className={styles.errorMessage}>{error}</p>}

              <button 
                type="submit" 
                disabled={isProcessing || (config?.needsPagePreview && selectedPages.size === 0 && files.length > 0)} 
                className={styles.submitBtn}
              >
                {isProcessing 
                  ? "Processing..." 
                  : config?.needsPagePreview 
                    ? selectedPages.size > 0 
                      ? `Delete ${selectedPages.size} Page${selectedPages.size > 1 ? "s" : ""}` 
                      : "Select Pages to Delete"
                    : "Process Files"
                }
              </button>
              
            </form>
          )}

          {analysisData && (
            <div className={styles.analysisResult}>
              <h3>Document Metadata</h3>
              <pre>
                {JSON.stringify(analysisData, null, 2)}
              </pre>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
