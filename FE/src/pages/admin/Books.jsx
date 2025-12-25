import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Pencil, Trash2, Loader2, X } from 'lucide-react';
import AdminBookService from '../../service/AdminBookService';
import AdminAuthorService from '../../service/AdminAuthorService';
import AdminSubjectService from '../../service/AdminSubjectService';
import Pagination from '../../components/admin/Pagination';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author_id: '',
    subjectIds: [],
    type: 'FREE',
    published_year: '',
    page_count: '',
    image_url: '',
    summary: '',
    language: 'Tiếng Việt'
  });

  const [authorFilter, setAuthorFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentPage, search, authorFilter, subjectFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        q: search,
        authorId: authorFilter,
        subjectId: subjectFilter
      };

      const booksData = await AdminBookService.getAllBooks(params);
      const authorsData = await AdminAuthorService.getAllAuthors();
      const subjectsData = await AdminSubjectService.getAllSubjects();

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

      setAuthors(Array.isArray(authorsData) ? authorsData : (authorsData?.data || []));
      setSubjects(Array.isArray(subjectsData) ? subjectsData : (subjectsData?.data || []));

    } catch (error) {
      console.error("Failed to fetch data", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
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
        subjectIds: [],
        type: book.type || 'FREE',
        published_year: book.published_year || '',
        page_count: book.page_count || '',
        image_url: book.image_url || '',
        summary: book.summary || '',
        language: book.language || 'Tiếng Việt'
      });
    } else {
      setFormData({
        title: '', author_id: '', subjectIds: [], type: 'FREE', published_year: '', page_count: '', image_url: '', summary: '', language: 'Tiếng Việt'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => { e.preventDefault(); };
  const handleDelete = async (id) => { };

  return (
    <div className="p-4 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý Sách</h2>
        <button onClick={() => handleOpenModal()} className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"><Plus size={16} /> Thêm sách</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Tác giả</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Năm XB</th>
              <th className="px-4 py-3">Tùy chọn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-4"><Loader2 className="animate-spin inline mr-2" /> Đang tải...</td></tr>
            ) : filteredBooks.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4">Không có dữ liệu</td></tr>
            ) : filteredBooks.map((b) => (
              <tr key={b.id || Math.random()}>
                <td className="px-4 py-3">{b.id}</td>
                <td className="px-4 py-3 font-medium">{b.title}</td>
                <td className="px-4 py-3 text-slate-600">
                  {b.author?.name || b.author_name || 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.type === 'PREMIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' : 'bg-green-100 text-green-700 dark:bg-green-900/30'}`}>
                    {b.type || 'FREE'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{b.published_year || ''}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleOpenModal(b)} className="p-2 text-blue-600"><Pencil size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{editingBook ? 'Sửa sách' : 'Thêm sách'}</h3>
            <p>Chức năng thêm/sửa đang được bảo trì để đảm bảo an toàn dữ liệu.</p>
            <button onClick={() => setShowModal(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
