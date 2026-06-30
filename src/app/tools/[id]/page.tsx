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
  needsPrompt?: boolean;
  needsTextOverlay?: boolean;
  needsSignature?: boolean;
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
  "extract-images": {
    title: "Extract PDF Images",
    description: "Extract all images embedded in your PDF document as a ZIP file.",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "extracted_images.zip",
  },
  "word-to-pdf": {
    title: "Word to PDF",
    description: "Convert Microsoft Word documents (.docx) to PDF format.",
    acceptType: ".docx",
    allowMultiple: false,
    defaultOutput: "converted.pdf",
  },
  "pdf-to-word": {
    title: "PDF to Word",
    description: "Convert PDF files to editable Word documents (.docx).",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "converted.docx",
  },
  "compress-pdf": {
    title: "Compress PDF",
    description: "Reduce the file size of your PDF while maintaining optimal quality.",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "compressed.pdf",
  },
  "ocr-image": {
    title: "OCR Image",
    description: "Extract readable and searchable text from an image (PNG, JPG).",
    acceptType: "image/jpeg, image/png, image/jpg",
    allowMultiple: false,
    defaultOutput: "extracted_text.txt",
  },
  "edit-pdf": {
    title: "Edit PDF",
    description: "Insert a custom text overlay on the pages of your PDF.",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "edited.pdf",
    needsTextOverlay: true,
  },
  "ppt-to-pdf": {
    title: "PowerPoint to PDF",
    description: "Convert PowerPoint presentations (.pptx) to PDF format.",
    acceptType: ".pptx",
    allowMultiple: false,
    defaultOutput: "converted.pdf",
  },
  "generate-pdf": {
    title: "Generate PDF",
    description: "Instantly draft a clean PDF document from a text prompt or topic.",
    acceptType: "",
    allowMultiple: false,
    defaultOutput: "generated.pdf",
    needsPrompt: true,
  },
  "sign-pdf": {
    title: "Sign PDF",
    description: "Draw your signature and place it securely on your PDF file.",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "signed.pdf",
    needsSignature: true,
  },
  "pdf-to-ppt": {
    title: "PDF to PPT",
    description: "Convert PDF pages back to editable PowerPoint slides (.pptx).",
    acceptType: ".pdf",
    allowMultiple: false,
    defaultOutput: "converted.pptx",
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

  // For premium tools
  const [promptText, setPromptText] = useState("");
  const [textOverlay, setTextOverlay] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  const [sigX, setSigX] = useState("100");
  const [sigY, setSigY] = useState("100");
  const [sigPage, setSigPage] = useState("1");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureImage(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setSignatureImage("");
    }
  };

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

    if (id !== "generate-pdf" && files.length === 0) {
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

    if (config?.needsSignature && !signatureImage) {
      setError("Please draw your signature in the pad below.");
      return;
    }

    if (config?.needsPrompt && !promptText.trim()) {
      setError("Please enter a prompt or draft topic.");
      return;
    }

    if (config?.needsTextOverlay && !textOverlay.trim()) {
      setError("Please enter the overlay text.");
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

      // Premium parameters
      if (promptText) formData.append("prompt", promptText);
      if (textOverlay) formData.append("text_overlay", textOverlay);
      if (signatureImage) formData.append("signature_image", signatureImage);
      if (sigX) formData.append("sig_x", sigX);
      if (sigY) formData.append("sig_y", sigY);
      if (sigPage) formData.append("sig_page", sigPage);

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
        "extract-images": "/api/pdf/extract-images",
        "word-to-pdf": "/api/pdf/word-to-pdf",
        "pdf-to-word": "/api/pdf/pdf-to-word",
        "compress-pdf": "/api/pdf/compress-pdf",
        "ocr-image": "/api/pdf/ocr-image",
        "edit-pdf": "/api/pdf/edit-pdf",
        "ppt-to-pdf": "/api/pdf/ppt-to-pdf",
        "generate-pdf": "/api/pdf/generate-pdf",
        "sign-pdf": "/api/pdf/sign-pdf",
        "pdf-to-ppt": "/api/pdf/pdf-to-ppt",
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
            Back to Tools
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
              {!config?.needsPrompt && (
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
              )}

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

              {/* Text Prompt input for generate-pdf */}
              {config?.needsPrompt && (
                <div className={styles.inputGroup}>
                  <label>Document Prompt / Draft Content</label>
                  <textarea 
                    value={promptText} 
                    onChange={(e) => setPromptText(e.target.value)} 
                    placeholder="Enter the draft topic or text content for your PDF..."
                    className={styles.textInput}
                    style={{ minHeight: "100px", resize: "vertical" }}
                    required
                  />
                </div>
              )}

              {/* Text Overlay input for edit-pdf */}
              {config?.needsTextOverlay && (
                <div className={styles.inputGroup}>
                  <label>Overlay Text</label>
                  <input 
                    type="text" 
                    value={textOverlay} 
                    onChange={(e) => setTextOverlay(e.target.value)} 
                    placeholder="Enter text to overlay on top of pages"
                    className={styles.textInput}
                    required
                  />
                </div>
              )}

              {/* Signature pad input for sign-pdf */}
              {config?.needsSignature && (
                <div className={styles.inputGroup}>
                  <label>Draw Signature</label>
                  <div style={{ border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", backgroundColor: "white", padding: "10px", display: "inline-block", width: "100%", maxWidth: "420px" }}>
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      style={{ border: "1px dashed var(--border-hover)", display: "block", cursor: "crosshair", backgroundColor: "#faf8f4", width: "100%", height: "150px" }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                      <button type="button" onClick={clearCanvas} className={styles.removeFileBtn}>Clear Pad</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                    <div style={{ flex: 1 }}>
                      <label>Page Number</label>
                      <input 
                        type="number" 
                        min="1"
                        value={sigPage} 
                        onChange={(e) => setSigPage(e.target.value)} 
                        className={styles.textInput}
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>X (px)</label>
                      <input 
                        type="number" 
                        value={sigX} 
                        onChange={(e) => setSigX(e.target.value)} 
                        className={styles.textInput}
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Y (px)</label>
                      <input 
                        type="number" 
                        value={sigY} 
                        onChange={(e) => setSigY(e.target.value)} 
                        className={styles.textInput}
                        required
                      />
                    </div>
                  </div>
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
