import styles from './ListSection.module.css';
import { useRef, useState, useEffect, useCallback } from 'react';
import { sampleCategories } from '@/lib/mockdata';

const Slider = ({ category, onSelectBook }) => {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeCardId, setActiveCardId] = useState(null);

  const checkScroll = useCallback(() => {
    if (trackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for precision
    }
  }, []);

  useEffect(() => {
    const trackElement = trackRef.current;
    if (trackElement) {
      // Initial check
      checkScroll();
      // Check on scroll
      trackElement.addEventListener('scroll', checkScroll);
      // Check on resize
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(trackElement);

      return () => {
        trackElement.removeEventListener('scroll', checkScroll);
        resizeObserver.unobserve(trackElement);
      };
    }
  }, [category.books, checkScroll]);

  const handleNavClick = (direction) => {
    if (trackRef.current) {
      const scrollAmount = trackRef.current.clientWidth * 0.8; // Scroll 80% of the visible width
      trackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleCardClick = (bookId) => {
    if (activeCardId === bookId) {
      setActiveCardId(null);
      onSelectBook(null);
    } else {
      setActiveCardId(bookId);
      const book = category.books.find(b => b.id === bookId);
      if(book) onSelectBook(book);
    }
  };

  return (
    <div className={styles.categorySection}>
      <h2 className={styles.categoryTitle}>{category.categoryTitle}</h2>
      <div className={styles.sliderWrapper}>
        {canScrollLeft && (
          <button
            className={`${styles.navButton} ${styles.left}`}
            onClick={() => handleNavClick('left')}
            aria-label="Scroll Left"
          >
            &#8249;
          </button>
        )}
        <div className={styles.sliderContainer} ref={trackRef}>
          <div className={styles.sliderTrack}>
            {category.books.map(book => (
              <div 
                key={book.id} 
                className={`${styles.cardContainer} ${activeCardId === book.id ? styles.isActive : ''}`}
                onClick={() => handleCardClick(book.id)}
              >
                <div className={styles.summaryCard}>
                  <img src={book.imageUrl} alt={`Bìa sách ${book.title}`} className={styles.bookImage} />
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                </div>
                <div className={styles.detailCard}>
                  <img src={book.imageUrl} alt={`Bìa sách ${book.title}`} className={styles.bookImage} />
                  <div className={styles.detailContent}>
                    <h3 className={styles.bookTitle}>{book.title}</h3>
                    <p className={styles.bookAuthor}>Tác giả: {book.author}</p>
                    <p className={styles.bookDescription}>{book.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {canScrollRight && (
          <button
            className={`${styles.navButton} ${styles.right}`}
            onClick={() => handleNavClick('right')}
            aria-label="Scroll Right"
          >
            &#8250;
          </button>
        )}
      </div>
    </div>
  );
};

export default function ListSection({ onSelectBook }) {
  return (
    <div className={styles.sectionContainer}>
      <section style={{ backgroundColor: '#f9f9f9', overflow: 'hidden' }}>
        {sampleCategories.map((category, index) => (
          <div key={index} className={styles.sliderCard}>
            <Slider category={category} onSelectBook={onSelectBook} />
          </div>
        ))}      
      </section>
    </div>

      );
}