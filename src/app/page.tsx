import Link from 'next/link';
import styles from './Lumina.module.css';

export default function Home() {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Effortless Documents.<br/>Made for You.</h1>
          <p className={styles.heroSubtitle}>Premium PDF tools handcrafted with privacy in mind and meticulously designed to save you time.</p>
          <Link href="/tools/merge-pdf" className={styles.btn}>Explore Tools</Link>
        </div>
        <div className={styles.heroImageContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero_abstract.png" alt="Floating documents abstract" />
        </div>
      </section>

      {/* Trust Banner */}
      <div className={styles.trustBanner}>
        <div className={styles.trustItem}>
          <div className={styles.trustText}>
            <h4>Free Processing</h4>
            <p>On all your documents</p>
          </div>
        </div>
        <div className={styles.trustItem}>
          <div className={styles.trustText}>
            <h4>100% Private</h4>
            <p>Deleted after 2 hours</p>
          </div>
        </div>
        <div className={styles.trustItem}>
          <div className={styles.trustText}>
            <h4>Cloud Powered</h4>
            <p>Fast & reliable</p>
          </div>
        </div>
        <div className={styles.trustItem}>
          <div className={styles.trustText}>
            <h4>Secure Output</h4>
            <p>256-bit SSL encryption</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Simplicity at its core</h2>
        <p className={styles.sectionSubtitle}>We designed Akshar Kitaab to be entirely frictionless. No signups required, no complicated interfaces. Just your documents, perfected.</p>
        
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>01</div>
            <h3 className={styles.stepTitle}>Upload File</h3>
            <p className={styles.stepDesc}>Drag and drop your document directly into our secure interface. We support all major file types.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>02</div>
            <h3 className={styles.stepTitle}>Select Tool</h3>
            <p className={styles.stepDesc}>Choose from over 20+ specialized tools designed to handle any PDF manipulation you require.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>03</div>
            <h3 className={styles.stepTitle}>Download Instantly</h3>
            <p className={styles.stepDesc}>Your perfected document is processed securely in the cloud and downloaded to your device in seconds.</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className={`${styles.section} ${styles.sectionAlt}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 60 }}>Browse by Category</h2>
          <Link href="/tools" className={styles.sectionTitleLink}>View All</Link>
        </div>
        <div className={styles.categoryGrid}>
          <Link href="/tools" className={styles.categoryCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cat_convert_to.png" alt="Convert to PDF" className={styles.categoryImage} />
            <h3 className={styles.categoryTitle}>Convert to PDF</h3>
            <span className={styles.categoryLink}>Explore</span>
          </Link>
          <Link href="/tools" className={styles.categoryCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cat_convert_from.png" alt="Convert from PDF" className={styles.categoryImage} />
            <h3 className={styles.categoryTitle}>Convert from PDF</h3>
            <span className={styles.categoryLink}>Explore</span>
          </Link>
          <Link href="/tools" className={styles.categoryCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cat_edit.png" alt="Edit & Optimize" className={styles.categoryImage} />
            <h3 className={styles.categoryTitle}>Edit & Optimize</h3>
            <span className={styles.categoryLink}>Explore</span>
          </Link>
          <Link href="/tools" className={styles.categoryCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cat_security.png" alt="Security" className={styles.categoryImage} />
            <h3 className={styles.categoryTitle}>Security</h3>
            <span className={styles.categoryLink}>Explore</span>
          </Link>
        </div>
      </section>

      {/* Story */}
      <section className={styles.storySection}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/story_workspace.png" alt="Elegant workspace" className={styles.storyImage} />
        <div className={styles.storyText}>
          <h2 className={styles.storyTitle}>Your Documents, Perfected</h2>
          <p className={styles.heroSubtitle}>Discover tools that celebrate your workflow. At Akshar Kitaab, we believe document management should be more than functional—it should be a seamless, elegant experience.</p>
          <Link href="/tools" className={styles.sectionTitleLink} style={{ textAlign: 'left', marginBottom: 0 }}>Discover More</Link>
        </div>
      </section>

      {/* Popular Tools Grid */}
      <section id="tools" className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 60 }}>Most Popular Tools</h2>
          <Link href="/tools" className={styles.sectionTitleLink}>View All 20 Tools</Link>
        </div>
        <div className={styles.toolsGrid}>
          <Link href="/tools/merge-pdf" className={styles.toolCard}>
            <div className={styles.toolIconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>
            </div>
            <div style={{ padding: '0 20px 30px' }}>
              <h3 className={styles.categoryTitle}>Merge PDF</h3>
              <span className={styles.categoryLink}>Free</span>
            </div>
          </Link>
          <Link href="/tools/split-pdf" className={styles.toolCard}>
            <div className={styles.toolIconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line></svg>
            </div>
            <div style={{ padding: '0 20px 30px' }}>
              <h3 className={styles.categoryTitle}>Split PDF</h3>
              <span className={styles.categoryLink}>Free</span>
            </div>
          </Link>
          <Link href="/tools/compress-pdf" className={styles.toolCard}>
            <div className={styles.toolIconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div style={{ padding: '0 20px 30px' }}>
              <h3 className={styles.categoryTitle}>Compress PDF</h3>
              <span className={styles.categoryLink}>Free</span>
            </div>
          </Link>
          <Link href="/tools/pdf-to-word" className={styles.toolCard}>
            <div className={styles.toolIconWrapper}>
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
            <div style={{ padding: '0 20px 30px' }}>
              <h3 className={styles.categoryTitle}>PDF to Word</h3>
              <span className={styles.categoryLink}>Free</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <h2 className={styles.sectionTitle}>What Our Users Say</h2>
        <p className={styles.sectionSubtitle}>Thousands of professionals trust Akshar Kitaab for their daily document workflows.</p>
        
        <div className={styles.reviewsGrid}>
          <div className={styles.reviewCard}>
            <div className={styles.stars}>★★★★★</div>
            <p className={styles.reviewText}>"The most beautiful and seamless PDF tool I have ever used. It perfectly handles all my legal documents in seconds without any privacy concerns."</p>
            <p className={styles.reviewerName}>Sarah Jenkins, Attorney</p>
          </div>
          <div className={styles.reviewCard}>
            <div className={styles.stars}>★★★★★</div>
            <p className={styles.reviewText}>"I compress and merge huge pitch decks every day. Akshar Kitaab handles large files elegantly and never crashes. Truly a premium experience."</p>
            <p className={styles.reviewerName}>David Chen, Marketing Director</p>
          </div>
          <div className={styles.reviewCard}>
            <div className={styles.stars}>★★★★★</div>
            <p className={styles.reviewText}>"I love that it's just drag, drop, and done. No annoying ads or popups like the other sites. It's perfectly designed for speed and simplicity."</p>
            <p className={styles.reviewerName}>Emily R., Graphic Designer</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>Is Akshar Kitaab really free to use?</h3>
            <p className={styles.faqAnswer}>Yes, all of our core PDF tools are 100% free for individual users. We offer a premium subscription if you require higher file size limits or batch processing.</p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>Are my documents secure?</h3>
            <p className={styles.faqAnswer}>Absolutely. All files are encrypted using 256-bit SSL during transfer. We do not store your files on our servers; they are permanently deleted automatically within 2 hours of processing.</p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>Do I need to download any software?</h3>
            <p className={styles.faqAnswer}>No, Akshar Kitaab operates entirely in the cloud. You can process your documents directly from your web browser on any device.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
