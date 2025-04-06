import { useState, useEffect } from 'react';
import styles from './Header.module.css';

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`${styles.header} ${isVisible ? styles.visible : styles.hidden}`}>
      <a href="/" className={styles.logo}>MyApp</a>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <a href="/" className={styles.navLink}>Главная</a>
          </li>
          <li className={styles.navItem}>
            <a href="/about" className={styles.navLink}>О нас</a>
          </li>
          <li className={styles.navItem}>
            <a href="/contact" className={styles.navLink}>Контакты</a>
          </li>
        </ul>
      </nav>
      <button className={styles.menuToggle}>☰</button>
    </header>
  );
};

export default Header;