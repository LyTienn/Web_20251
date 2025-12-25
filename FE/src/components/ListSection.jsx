import BookCard from "@/components/BookCard";

const Slider = ({ category, onSelectBook }) => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">{category.categoryTitle}</h2>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
          {category.books.map(book => (
            <div
              key={book.id}
              className="min-w-[180px] max-w-[180px] shrink-0 cursor-pointer"
              onClick={() => onSelectBook && onSelectBook(book)}
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>
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

    return categoryList;
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
          <Slider key={index} category={category} onSelectBook={onSelectBook} />
        ))}
      </section>
    </div>
  );
}