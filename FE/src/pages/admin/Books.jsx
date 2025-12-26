import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, Filter, Pencil, Trash2, Loader2, X, ChevronDown } from 'lucide-react';
import AdminBookService from '../../service/AdminBookService';
import AdminAuthorService from '../../service/AdminAuthorService';
import AdminSubjectService from '../../service/AdminSubjectService';
import Pagination from '../../components/admin/Pagination';

// Custom Searchable Subject Select Component
function SubjectSelect({ subjects, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const selectedSubject = subjects.find(s => s.id === value);

  useEffect(() => {
    if (!value) {
      setSearchTerm('');
    } else if (selectedSubject) {
      setSearchTerm(selectedSubject.name);
    }
  }, [value, selectedSubject]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedSubject) {
          setSearchTerm(selectedSubject.name);
        } else if (!value) {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, selectedSubject]);

  const filteredSubjects = subjects
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (subject) => {
    onChange(subject.id);
    setSearchTerm(subject.name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none h-[38px] pr-8 cursor-text"
          placeholder="Tất cả chủ đề"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') {
              onChange('');
            }
          }}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => handleSelect(subject)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${value === subject.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}
              >
                {subject.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400 text-center">Không tìm thấy</div>
          )}
        </div>
      )}
    </div>
  );
}

// Custom Searchable Select Component
function AuthorSelect({ authors, value, onChange, placeholder = "Tất cả tác giả" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const selectedAuthor = authors.find(a => a.id === value);

  useEffect(() => {
    // Reset search term when value changes externally (e.g. clear filters)
    if (!value) {
      setSearchTerm('');
    } else if (selectedAuthor) {
      setSearchTerm(selectedAuthor.name);
    }
  }, [value, selectedAuthor]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        // If closed without selection, revert text to selected value or empty
        if (selectedAuthor) {
          setSearchTerm(selectedAuthor.name);
        } else if (!value) {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, selectedAuthor]);

  const filteredAuthors = authors
    .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (author) => {
    onChange(author.id);
    setSearchTerm(author.name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none h-[38px] pr-8 cursor-text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') {
              onChange(''); // Clear filter if input cleared
            }
          }}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredAuthors.length > 0 ? (
            filteredAuthors.map(author => (
              <button
                key={author.id}
                onClick={() => handleSelect(author)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${value === author.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}
              >
                {author.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400 text-center">Không tìm thấy</div>
          )}
        </div>
      )}
    </div>
  );
}

// Custom Multi-Select Component for Subjects
function MultiSubjectSelect({ subjects, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSubjects = subjects
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(s => !value.includes(s.id)); // Exclude already selected

  const handleSelect = (subject) => {
    onChange([...value, subject.id]);
    setSearchTerm('');
  };

  const handleRemove = (id) => {
    onChange(value.filter(v => v !== id));
  };

  const selectedSubjectsNames = value.map(id => {
    const s = subjects.find(sub => sub.id === id);
    return s ? s.name : id;
  });

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex flex-wrap items-center gap-1.5 w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus-within:ring-2 focus-within:ring-primary/50 min-h-[42px]">
        {selectedSubjectsNames.map((name, index) => (
          <span key={value[index]} className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded text-xs flex items-center gap-1">
            {name}
            <button
              type="button"
              onClick={() => handleRemove(value[index])}
              className="hover:text-blue-900 dark:hover:text-blue-100"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          className="flex-1 bg-transparent outline-none min-w-[80px]"
          placeholder={value.length === 0 ? "Chọn chủ đề..." : ""}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map(subject => (
              <button
                type="button"
                key={subject.id}
                onClick={() => handleSelect(subject)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {subject.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400 text-center">
              {searchTerm ? "Không tìm thấy" : "Nhập để tìm kiếm"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Books() {
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  // ... (rest of the file content)


  const itemsPerPage = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author_id: '',
    subjectIds: [],
    type: 'FREE',
    page_count: '',
    image_url: '',
    summary: '',
    language: 'Tiếng Việt'
  });

  const [authorFilter, setAuthorFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentPage, search, authorFilter, subjectFilter, typeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        q: search,
        authorId: authorFilter,
        subjectId: subjectFilter,
        type: typeFilter
      };

      const booksData = await AdminBookService.getAllBooks(params);
      const authorsData = await AdminAuthorService.getAllAuthors({ limit: 1000 });
      const subjectsData = await AdminSubjectService.getAllSubjects({ limit: 1000 });

      // Robust Data Handling
      if (booksData && Array.isArray(booksData.books)) {
        setBooks(booksData.books);
        setTotalPages(booksData.totalPages || 0);
      } else if (booksData && typeof booksData === 'object' && Array.isArray(booksData.data)) { // Support alternate format
        setBooks(booksData.data);
      } else if (Array.isArray(booksData)) {
        setBooks(booksData);
      } else {
        console.warn("Invalid Books Data Structure", booksData);
        setBooks([]);
      }

      // Handle Authors Data (Support both array and paginated response)
      let authorsList = [];
      if (Array.isArray(authorsData)) {
        authorsList = authorsData;
      } else if (authorsData?.authors && Array.isArray(authorsData.authors)) {
        authorsList = authorsData.authors;
      } else if (authorsData?.data && Array.isArray(authorsData.data)) {
        authorsList = authorsData.data;
      }

      // Sort by book count descending (Popular authors first)
      authorsList.sort((a, b) => {
        const countA = parseInt(a.books_count || 0);
        const countB = parseInt(b.books_count || 0);
        return countB - countA;
      });

      setAuthors(authorsList);

      // Handle Subjects Data (Support both array and paginated response)
      let subjectsList = [];
      if (Array.isArray(subjectsData)) {
        subjectsList = subjectsData;
      } else if (subjectsData?.subjects && Array.isArray(subjectsData.subjects)) {
        subjectsList = subjectsData.subjects;
      } else if (subjectsData?.data && Array.isArray(subjectsData.data)) {
        subjectsList = subjectsData.data;
      }

      // Sort by book count descending (Popular subjects first)
      subjectsList.sort((a, b) => {
        const countA = parseInt(a.books_count || 0);
        const countB = parseInt(b.books_count || 0);
        return countB - countA;
      });

      setSubjects(subjectsList);

    } catch (error) {
      console.error("Failed to fetch data", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setAuthorFilter('');
    setSubjectFilter('');
    setTypeFilter('');
    setSearch('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Safe filtering
  const filteredBooks = Array.isArray(books) ? books.filter(b => {
    // Basic safety checks
    if (!b) return false;
    return true; // Simplified filtering for stability
  }) : [];

  const handleOpenModal = (book = null) => {
    setEditingBook(book);
    if (book) {
      setFormData({
        title: book.title || '',
        author_id: book.author_id || '',
        subjectIds: book.subjects ? book.subjects.map(s => s.id) : (book.subjectIds || []),
        type: book.type || 'FREE',
        chapter_count: book.chapter_count || 0, // Restored chapter_count
        page_count: book.page_count || '',
        image_url: book.image_url || '',
        summary: book.summary || '',
        language: book.language || 'Tiếng Việt'
      });
    } else {
      setFormData({
        title: '', author_id: '', subjectIds: [], type: 'FREE', page_count: 0, image_url: '', summary: '', language: 'Tiếng Việt'
      });
    }
    setShowModal(true);
  };

  useEffect(() => {
    if (location.state?.openAddModal) {
      handleOpenModal();
      window.history.replaceState({}, '');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.author_id) {
      alert("Vui lòng chọn tác giả!");
      return;
    }
    try {
      if (editingBook) {
        await AdminBookService.updateBook(editingBook.id, formData);
        alert('Cập nhật sách thành công!');
      } else {
        await AdminBookService.createBook(formData);
        alert('Thêm sách mới thành công!');
      }
      setShowModal(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      try {
        await AdminBookService.deleteBook(id);
        alert('Xóa sách thành công!');
        fetchData();
      } catch (error) {
        console.error(error);
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">Quản lý Sách</h2>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
          <Plus size={18} /> <span>Thêm sách mới</span>
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm tiêu đề..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Tác giả</label>
            <AuthorSelect
              authors={authors}
              value={authorFilter}
              onChange={setAuthorFilter}
            />
          </div>

          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Chủ đề</label>
            <SubjectSelect
              subjects={subjects}
              value={subjectFilter}
              onChange={setSubjectFilter}
            />
          </div>

          <div className="w-full md:w-40">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Loại sách</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none h-[38px]"
            >
              <option value="">Tất cả loại</option>
              <option value="FREE">Miễn phí</option>
              <option value="PREMIUM">Trả phí</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors h-[38px] whitespace-nowrap"
          >
            Đặt lại
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Ảnh</th>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Tác giả</th>
              <th className="px-4 py-3">Chủ đề</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Ngôn ngữ</th>
              <th className="px-4 py-3">Số chương</th>
              <th className="px-4 py-3">Tùy chọn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {loading ? (

              <tr><td colSpan="9" className="text-center py-4"><Loader2 className="animate-spin inline mr-2" /> Đang tải...</td></tr>
            ) : filteredBooks.length === 0 ? (
              <tr><td colSpan="9" className="text-center py-4">Không có dữ liệu</td></tr>
            ) : filteredBooks.map((b) => (
              <tr key={b.id || Math.random()}>
                <td className="px-4 py-3">{b.id}</td>
                <td className="px-4 py-3">
                  <img
                    src={b.image_url || 'https://via.placeholder.com/40'}
                    alt={b.title}
                    className="w-10 h-14 object-cover rounded border border-slate-200 dark:border-slate-700"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40?text=Book'; }}
                  />
                </td>
                <td className="px-4 py-3 font-medium">{b.title}</td>
                <td className="px-4 py-3 text-slate-600">
                  {b.author?.name || b.author_name || 'N/A'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div className="flex flex-wrap gap-1">
                    {b.subjects && b.subjects.length > 0 ? (
                      b.subjects.slice(0, 3).map(s => (
                        <span key={s.id} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Trống</span>
                    )}
                    {b.subjects && b.subjects.length > 3 && (
                      <span className="text-xs text-slate-400">+{b.subjects.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.type === 'PREMIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' : 'bg-green-100 text-green-700 dark:bg-green-900/30'}`}>
                    {b.type || 'FREE'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{b.language || 'Tiếng Việt'}</td>
                <td className="px-4 py-3 text-slate-600">{b.chapter_count || 0}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleOpenModal(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors mr-1" title="Sửa"><Pencil size={18} /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Xóa"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      {
        showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl w-full max-w-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">{editingBook ? 'Cập nhật Sách' : 'Thêm Sách Mới'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tiêu đề <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 text-sm"
                      placeholder="Nhập tiêu đề sách..."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tác giả <span className="text-red-500">*</span></label>
                    <AuthorSelect
                      authors={authors}
                      value={formData.author_id}
                      onChange={(id) => setFormData({ ...formData, author_id: id })}
                      placeholder="Chọn tác giả..."
                    />
                  </div>



                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Số chương</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.chapter_count || 0}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 text-sm cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loại sách</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                      <option value="FREE">Miễn phí (FREE)</option>
                      <option value="PREMIUM">Trả phí (PREMIUM)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ngôn ngữ</label>
                    <input
                      type="text"
                      value={formData.language}
                      onChange={e => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chủ đề</label>
                    <MultiSubjectSelect
                      subjects={subjects}
                      value={formData.subjectIds}
                      onChange={(newIds) => setFormData({ ...formData, subjectIds: newIds })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">URL Ảnh bìa</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tóm tắt nội dung</label>
                  <textarea
                    rows={4}
                    value={formData.summary}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 text-sm"
                    placeholder="Nhập tóm tắt..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/20"
                  >
                    {editingBook ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}
