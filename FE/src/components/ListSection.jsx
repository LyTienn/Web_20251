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
      const subjects = Array.isArray(book.subjects) && book.subjects.length > 0
        ? book.subjects
        : [{ name: 'Khác' }];
      subjects.forEach(subject => {
        const subjectName = subject.name || 'Khác';
        if (!groupedData[subjectName]) {
          groupedData[subjectName] = [];
        }
        if (!groupedData[subjectName].find(b => b.id === book.id)) {
          groupedData[subjectName].push(book);
        }
      });
    });
    return Object.keys(groupedData).map(key => ({
      categoryTitle: key,
      books: groupedData[key]
    }));
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