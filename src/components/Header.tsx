"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logoSerif}>Akshar</span> 
            <span className={styles.logoSans}>KITAAB</span>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/tools" className={pathname === "/tools" ? styles.active : ""}>
            Tools
          </Link>
          <Link href="/#categories" className={pathname === "/#categories" ? styles.active : ""}>
            Collections
          </Link>
          <Link href="/pricing" className={pathname === "/pricing" ? styles.active : ""}>
            Pricing
          </Link>
        </nav>
      </div>
    </header>
  );
}
