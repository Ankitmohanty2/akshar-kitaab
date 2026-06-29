"use client";

import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import styles from "./PdfPagePreview.module.css";

// Set the worker source to local file in public/
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface PdfPagePreviewProps {
  file: File;
  selectedPages: Set<number>;
  onTogglePage: (pageNum: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onPagesLoaded?: (totalPages: number) => void;
}

export default function PdfPagePreview({
  file,
  selectedPages,
  onTogglePage,
  onSelectAll,
  onDeselectAll,
  onPagesLoaded,
}: PdfPagePreviewProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderThumbnails() {
      setLoading(true);
      setError("");
      setThumbnails([]);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        if (cancelled) return;
        setTotalPages(numPages);
        onPagesLoaded?.(numPages);

        const thumbs: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.4 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          thumbs.push(canvas.toDataURL("image/jpeg", 0.7));
        }

        if (!cancelled) {
          setThumbnails(thumbs);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError("Failed to load PDF preview. The file may be corrupted or password-protected.");
          console.error("PDF preview error:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    renderThumbnails();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  if (error) {
    return <div className={styles.errorBox}>{error}</div>;
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Generating page previews...</p>
      </div>
    );
  }

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <p className={styles.previewTitle}>
          Click pages to select for deletion
          <span className={styles.selectedCount}>
            {selectedPages.size} of {totalPages} selected
          </span>
        </p>
        <div className={styles.selectionActions}>
          <button type="button" onClick={onSelectAll} className={styles.actionBtn}>
            Select All
          </button>
          <button type="button" onClick={onDeselectAll} className={styles.actionBtn}>
            Deselect All
          </button>
        </div>
      </div>

      <div className={styles.thumbnailGrid}>
        {thumbnails.map((thumb, index) => {
          const pageNum = index + 1;
          const isSelected = selectedPages.has(pageNum);
          return (
            <button
              key={pageNum}
              type="button"
              className={`${styles.thumbnailCard} ${isSelected ? styles.selected : ""}`}
              onClick={() => onTogglePage(pageNum)}
            >
              <div className={styles.thumbnailImageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb}
                  alt={`Page ${pageNum}`}
                  className={styles.thumbnailImage}
                />
                {isSelected && (
                  <div className={styles.selectedOverlay}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </div>
                )}
              </div>
              <span className={styles.pageLabel}>{pageNum}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
