import { useState, useEffect } from 'react';
import ListSection from '../components/ListSection';
import HeaderBar from '../components/HeaderBar';
import axios from '@/config/Axios-config';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const HomePage = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/books');
        if (response.success && response.data) {
          const normalizedData = response.data.map(book => ({
            ...book,
            imageUrl: book.imageUrl || book.image_url || 'https://placehold.co/150x220?text=No+Image',
            author: typeof book.author === 'object' ? book.author?.name : book.author
          }));
          setAllBooks(normalizedData);
          setFilteredBooks(normalizedData);
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleSearchResult = (results) => {
    setFilteredBooks(results || allBooks);
  };

  const handleSelectBook = (book) => {
    if (book && book.id) {
      navigate(`/book/${book.id}`);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Đang tải thư viện...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar searchData={allBooks} onSearchResult={handleSearchResult}/>
      {/* Banner tràn viền */}
      <div className="relative w-full">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          loop
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="w-full h-[300px]"
        >
          <SwiperSlide>
            <img src="https://307a0e78.vws.vegacdn.vn/view/v2/image/img.banner_web_v2/0/0/0/4459.jpg?v=1&w=1920&h=600" alt="Banner 1" className="w-full h-[300px] object-cover" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://307a0e78.vws.vegacdn.vn/view/v2/image/img.banner_web_v2/0/0/0/3979.jpg?v=1&w=1920&h=600" alt="Banner 2" className="w-full h-[300px] object-cover" />
          </SwiperSlide>
          {/* Thêm các SwiperSlide khác nếu muốn */}
        </Swiper>
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-white to-transparent" />
      </div>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">Khám phá thế giới sách</h1>
          <p className="text-muted-foreground text-lg">Hàng ngàn đầu sách đang chờ bạn khám phá</p>
          <ListSection books={filteredBooks} onSelectBook={handleSelectBook} />
        </div>
      </main>
    </div>
  );
};

export default HomePage;