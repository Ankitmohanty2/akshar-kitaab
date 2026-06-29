import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* Upper Call to Action Section */}
        <div className={styles.ctaSection}>
          <div className={styles.ctaText}>
            <h2 className={styles.ctaTitle}>Ready to perfect your documents?</h2>
            <p className={styles.ctaSubtitle}>Handcrafted tools designed to elevate your document workflows with complete privacy.</p>
          </div>
          <div className={styles.ctaAction}>
            <Link href="/tools" className={styles.ctaButton}>
              Explore All Tools
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.ctaArrow}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Main Footer Links & Info Grid */}
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <span className={styles.logoSerif}>Akshar</span> 
              <span className={styles.logoSans}>KITAAB</span>
            </div>
            <p className={styles.brandDesc}>
              Beautifully simple tools for modern document handling, crafted with strict local privacy. No trackers, no bloat.
            </p>
            <div className={styles.socials}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>

          <div className={styles.linksGrid}>
            <div className={styles.column}>
              <h4 className={styles.colTitle}>Solutions</h4>
              <ul className={styles.list}>
                <li><Link href="/tools/merge-pdf" className={styles.link}>Merge Documents</Link></li>
                <li><Link href="/tools/split-pdf" className={styles.link}>Split & Extract</Link></li>
                <li><Link href="/tools/delete-pages" className={styles.link}>Delete Pages</Link></li>
                <li><Link href="/tools/compress-image" className={styles.link}>Optimize Images</Link></li>
              </ul>
            </div>
            <div className={styles.column}>
              <h4 className={styles.colTitle}>Company</h4>
              <ul className={styles.list}>
                <li><Link href="#" className={styles.link}>Our Story</Link></li>
                <li><Link href="#" className={styles.link}>Privacy First</Link></li>
                <li><Link href="#" className={styles.link}>Journal</Link></li>
                <li><Link href="#" className={styles.link}>Get In Touch</Link></li>
              </ul>
            </div>
            <div className={styles.column}>
              <h4 className={styles.colTitle}>Legal</h4>
              <ul className={styles.list}>
                <li><Link href="#" className={styles.link}>Terms of Service</Link></li>
                <li><Link href="#" className={styles.link}>Privacy Policy</Link></li>
                <li><Link href="#" className={styles.link}>Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <hr className={styles.dividerSub} />

        {/* Copyright Section */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; {currentYear} Akshar KITAAB. Handcrafted with care. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <span>Secure Cloud Engine v1.2</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
