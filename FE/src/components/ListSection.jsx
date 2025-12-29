import BookCard from "@/components/BookCard";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const Slider = ({ category, onSelectBook, index }) => {
  const isReverse = index % 2 !== 0; // Hàng lẻ chạy ngược (phải -> trái)

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4 text-slate-800">{category.categoryTitle}</h2>
      <div className="relative">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={16}
          slidesPerView={'auto'}
          loop={category.books.length >= 10} // Chỉ loop nếu đủ nhiều sách để tránh lỗi loop của Swiper
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            reverseDirection: isReverse,
            pauseOnMouseEnter: true
          }}
          className="pb-4"
        >
          {category.books.map(book => (
            <SwiperSlide key={book.id} className="!w-[180px] !h-auto">
              <div
                className="cursor-pointer hover:scale-105 transition-transform duration-300 h-full"
                onClick={() => onSelectBook && onSelectBook(book)}
              >
                <BookCard book={book} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default function ListSection({ books = [], onSelectBook }) {
  // Gom nhóm sách theo Subject (Category)
  const getCategorizedBooks = () => {
    const groupedData = {};
    books.forEach(book => {
      const shelves = Array.isArray(book.bookshelves) && book.bookshelves.length > 0
        ? book.bookshelves
        : [{ name: 'Khác' }];
      shelves.forEach(shelf => {
        const shelfName = shelf.name || 'Khác';
        if (!groupedData[shelfName]) {
          groupedData[shelfName] = [];
        }
        if (!groupedData[shelfName].find(b => b.id === book.id)) {
          groupedData[shelfName].push(book);
        }
      });
    });

    const categoryList = Object.keys(groupedData).map(key => ({
      categoryTitle: key,
      books: groupedData[key]
    }));

    // Add 'Sách mới' (New Books) at the beginning containing first 10 books
    if (books.length > 0) {
      categoryList.unshift({
        categoryTitle: 'Sách mới cập nhật',
        books: books.slice(0, 10)
      });
    }

    return categoryList.filter(cat =>
      cat.categoryTitle === 'Sách mới cập nhật' || cat.books.length >= 5
    );
  };

  const categories = getCategorizedBooks();

  if (!books || books.length === 0) {
    return (
      <div className="flex min-h-[300px] justify-center items-center">
        <p className="text-slate-500">Chưa có cuốn sách nào trong thư viện.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section>
        {categories.map((category, index) => (
          <Slider
            key={index}
            category={category}
            onSelectBook={onSelectBook}
            index={index}
          />
        ))}
      </section>
    </div>
  );
}