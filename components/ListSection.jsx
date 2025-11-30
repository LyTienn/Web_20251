import styles from './ListSection.module.css';
import { useRef, useState, useEffect, useCallback } from 'react';

const sampleCategories = [
  {
    categoryTitle: 'Sách Bán Chạy',
    books: [
      {
        id: 1,
        title: 'Nhà Giả Kim',
        author: 'Paulo Coelho',
        imageUrl: 'https://via.placeholder.com/150x220.png?text=Nhà+Giả+Kim',
        description: 'Cuốn tiểu thuyết nổi tiếng về hành trình theo đuổi vận mệnh của chàng chăn cừu Santiago.'
      },
      {
        id: 2,
        title: 'Đắc Nhân Tâm',
        author: 'Dale Carnegie',
        imageUrl: 'https://via.placeholder.com/150x220.png?text=Đắc+Nhân+Tâm',
        description: 'Nghệ thuật giao tiếp và ứng xử để đạt được thành công trong cuộc sống.'
      },
      {
        id: 3,
        title: 'Muôn Kiếp Nhân Sinh',
        author: 'Nguyên Phong',
        imageUrl: 'https://via.placeholder.com/150x220.png?text=Muôn+Kiếp',
        description: 'Hành trình luân hồi và những bài học sâu sắc về luật nhân quả.'
      },
      {
        id: 4,
        title: 'Cây Cam Ngọt Của Tôi',
        author: 'J. M. de Vasconcelos',
        imageUrl: 'https://via.placeholder.com/150x220.png?text=Cây+Cam',
        description: 'Câu chuyện cảm động về tuổi thơ của một cậu bé thông minh và tinh nghịch.'
      },
    ]
  },
  {
    categoryTitle: 'Văn Học Việt Nam',
    books: [
      {
        id: 5,
        title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
        author: 'Nguyễn Nhật Ánh',
        imageUrl: 'https://via.placeholder.com/150x220.png?text=Hoa+Vàng',
        description: 'Câu chuyện tuổi thơ trong sáng, hồn nhiên ở một làng quê Việt Nam.'
      },
      {
        id: 6,
        title: 'Số Đỏ',
        author: 'Vũ Trọng Phụng',
        imageUrl: 'https://via.placeholder.com/150x220.png?text=Số+Đỏ',
        description: 'Tác phẩm châm biếm kinh điển về xã hội thành thị Việt Nam thời Pháp thuộc.'
      },
      {
        id: 7,
        title: 'Dế Mèn Phiêu Lưu Ký',
        author: 'Tô Hoài',
        imageUrl: 'https://via.placeholder.com/150x220.png?text=Dế+Mèn',
        description: 'Cuộc phiêu lưu của chú Dế Mèn qua thế giới loài vật đầy màu sắc.'
      },
    ]
  }
];


const Slider = ({ category }) => {
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
    } else {
      setActiveCardId(bookId);
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

export default function ListSection() {
  return (
    <div className={styles.sectionContainer}>
      <section style={{ backgroundColor: '#f9f9f9', overflow: 'hidden' }}>
        {sampleCategories.map((category, index) => (
          <div key={index} className={styles.sliderCard}>
            <Slider category={category} />
          </div>
        ))}      
      </section>
    </div>

      );
}