import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContent}>
        <h1 className={`heading-serif ${styles.title}`}>Akshar Kitaab</h1>
        <p className={styles.subtitle}>
          Every tool you need to work with PDFs in one beautiful place.<br />
          Merge, split, compress, convert, and edit your PDF files with ease.
        </p>

        <div className={`glass ${styles.promptBox}`}>
          <textarea 
            placeholder="Search for a PDF tool (e.g., Convert PDF to Word)..."
            className={styles.promptInput}
            rows={3}
          ></textarea>
          <div className={styles.promptActions}>
            <div className={styles.promptType}>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
               <span>All PDF Tools</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <button className={styles.submitBtn}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
