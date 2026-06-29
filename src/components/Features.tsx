"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './Features.module.css';

interface Feature {
  id: string;
  title: string;
  desc: string;
  category: 'convert' | 'edit' | 'security' | 'other';
  icon: React.ReactNode;
}

export default function Features() {
  const [activeTab, setActiveTab] = useState<'all' | 'convert' | 'edit' | 'security' | 'other'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const featuresList = useMemo<Feature[]>(() => [
    {
      id: 'extract-images',
      title: 'Extract Images',
      desc: 'Extract all images contained in a PDF file.',
      category: 'edit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      )
    },
    {
      id: 'image-to-pdf',
      title: 'Image to PDF',
      desc: 'Convert JPG, PNG or GIF to PDF.',
      category: 'convert',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      )
    },
    {
      id: 'word-to-pdf',
      title: 'Word to PDF',
      desc: 'Make DOC and DOCX files easy to read by converting to PDF.',
      category: 'convert',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    },
    {
      id: 'pdf-to-word',
      title: 'PDF to Word',
      desc: 'Easily convert PDF files into editable Word documents.',
      category: 'convert',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M8 13h2v4a2 2 0 0 0 4 0v-4h2"></path>
        </svg>
      )
    },
    {
      id: 'split-pdf',
      title: 'Split PDF',
      desc: 'Separate one page or a whole set for easy conversion.',
      category: 'edit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3"></circle>
          <circle cx="6" cy="18" r="3"></circle>
          <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
          <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
          <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
        </svg>
      )
    },
    {
      id: 'merge-pdf',
      title: 'Merge PDFs',
      desc: 'Combine multiple PDF files into a single document.',
      category: 'edit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"></path>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>
      )
    },
    {
      id: 'delete-pages',
      title: 'Delete PDF Pages',
      desc: 'Remove pages from a PDF document visually.',
      category: 'edit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      )
    },
    {
      id: 'analyse-pdf',
      title: 'Analyse PDF',
      desc: 'Get detailed metadata and structure details of your PDF.',
      category: 'edit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      )
    },
    {
      id: 'compress-pdf',
      title: 'Compress PDF',
      desc: 'Reduce file size while keeping high visual quality.',
      category: 'edit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14h6v6"></path>
          <path d="M20 10h-6V4"></path>
          <path d="M14 10l7-7"></path>
          <path d="M10 14l-7 7"></path>
        </svg>
      )
    },
    {
      id: 'compress-image',
      title: 'Compress Image',
      desc: 'Compress images with optimal quality and speed.',
      category: 'edit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 12a4 4 0 0 1-8 0"></path>
        </svg>
      )
    },
    {
      id: 'ocr-image',
      title: 'OCR Image',
      desc: 'Convert scanned images and photos to editable text format.',
      category: 'other',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 7 4 4 20 4 20 7"></polyline>
          <line x1="9" y1="20" x2="15" y2="20"></line>
          <line x1="12" y1="4" x2="12" y2="20"></line>
        </svg>
      )
    },
    {
      id: 'edit-pdf',
      title: 'Edit PDF',
      desc: 'Add text, shapes, or draw freehand over your PDF page.',
      category: 'edit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
        </svg>
      )
    },
    {
      id: 'rotate-pdf',
      title: 'Rotate PDF',
      desc: 'Rotate PDF pages clockwise or counter-clockwise easily.',
      category: 'edit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
        </svg>
      )
    },
    {
      id: 'lock-pdf',
      title: 'Lock PDF',
      desc: 'Secure PDF files with strong custom password encryption.',
      category: 'security',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      )
    },
    {
      id: 'unlock-pdf',
      title: 'Unlock PDF',
      desc: 'Remove password lock from PDF files instantly.',
      category: 'security',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
        </svg>
      )
    },
    {
      id: 'ppt-to-pdf',
      title: 'PowerPoint to PDF',
      desc: 'Convert PPT/PPTX slide presentations to PDF documents.',
      category: 'convert',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
          <path d="m10 9 5 3-5 3v-6Z"></path>
        </svg>
      )
    },
    {
      id: 'crop-pdf',
      title: 'Crop PDF',
      desc: 'Trim boundaries, crop content margins, and resize pages.',
      category: 'edit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 1v3H1v2h5v12h12v5h2v-5h3v-2h-3V6a2 2 0 0 0-2-2H6Z"></path>
        </svg>
      )
    },
    {
      id: 'generate-pdf',
      title: 'Generate PDF',
      desc: 'Instantly generate complete, formatted PDFs from a text topic.',
      category: 'other',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      )
    },
    {
      id: 'sign-pdf',
      title: 'Sign PDF',
      desc: 'Sign and apply drawing or typed signatures to a PDF.',
      category: 'security',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 20H4"></path>
          <path d="M20 16V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12"></path>
          <path d="M12 11h4"></path>
          <path d="M12 7h4"></path>
          <path d="M8 7h.01"></path>
          <path d="M8 11h.01"></path>
        </svg>
      )
    },
    {
      id: 'pdf-to-ppt',
      title: 'PDF to PPT',
      desc: 'Convert PDF document pages back to PowerPoint presentations.',
      category: 'convert',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 12-5-3v6Z"></path>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      )
    }
  ], []);

  const filteredFeatures = useMemo(() => {
    return featuresList.filter((feature) => {
      const matchesTab = activeTab === 'all' || feature.category === activeTab;
      const matchesSearch =
        feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [featuresList, activeTab, searchQuery]);

  return (
    <section id="features" className={styles.featuresSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Handcrafted Document Utilities</h2>
        <p className={styles.sectionSubtitle}>
          Secure and private local document tools with a beautiful, unified workspace interface.
        </p>

        {/* Filter Controls & Search */}
        <div className={styles.controlsRow}>
          <div className={styles.tabsList}>
            {(['all', 'convert', 'edit', 'security', 'other'] as const).map((tab) => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'all' ? 'All Tools' : tab === 'edit' ? 'Edit & Optimize' : tab}
              </button>
            ))}
          </div>

          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Tools Grid */}
        <div className={styles.grid}>
          {filteredFeatures.map((feature) => (
            <Link
              href={`/tools/${feature.id}`}
              key={feature.id}
              className={`${styles.card} ${styles[feature.category]}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.iconCircle}>
                  {feature.icon}
                </div>
                <span className={styles.arrow}>&rarr;</span>
              </div>
              <h3 className={styles.title}>{feature.title}</h3>
              <p className={styles.description}>{feature.desc}</p>
            </Link>
          ))}
        </div>

        {filteredFeatures.length === 0 && (
          <div className={styles.noResults}>
            <h3>No tools match your criteria</h3>
            <p>Try searching for a different term or clear the filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}
