import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Search } from 'lucide-react';
import AdminAuthorService from '../../service/AdminAuthorService';
import Pagination from '../../components/admin/Pagination';

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [formData, setFormData] = useState({ name: '', birth_year: '', death_year: '' });

  // Pagination & Search & Sort
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'default', direction: 'ASC' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAuthors();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, search, sortConfig]);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        q: search,
        sort: sortConfig.key !== 'default' ? sortConfig.key : undefined,
        order: sortConfig.direction
      };
      const res = await AdminAuthorService.getAllAuthors(params);
      if (res && res.authors) {
        setAuthors(res.authors || []);
        setTotalPages(res.totalPages || 0);
      } else if (Array.isArray(res)) {
        setAuthors(res); // Fallback
      }
    } catch (error) {
      console.error("Failed to fetch authors", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenModal = (author = null) => {
    setEditingAuthor(author);
    if (author) {
      setFormData({
        name: author.name,
        birth_year: author.birth_year || '',
        death_year: author.death_year || ''
      });
    } else {
      setFormData({ name: '', birth_year: '', death_year: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAuthor) {
        await AdminAuthorService.updateAuthor(editingAuthor.id, formData);
      } else {
        await AdminAuthorService.createAuthor(formData);
      }
      setShowModal(false);
      fetchAuthors();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await AdminAuthorService.deleteAuthor(id);
        fetchAuthors();
      } catch (error) {
        alert("Lỗi xóa: " + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <div className="p-6 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Tác giả</h2>
          <p className="text-slate-500 dark:text-slate-400">Thông tin và quản trị tác giả.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Thêm tác giả</span>
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-6 mx-4">
        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
          {/* Search Bar */}
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="Tìm tiêu đề..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* Name Sort */}
          <div className="w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Sắp xếp tên</label>
            <select
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none min-w-[150px]"
              value={sortConfig.key === 'name' && sortConfig.direction === 'DESC' ? 'NAME_DESC' : 'default-ASC'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'NAME_DESC') {
                  setSortConfig({ key: 'name', direction: 'DESC' });
                } else {
                  setSortConfig({ key: 'default', direction: 'ASC' });
                }
                setCurrentPage(1);
              }}
            >
              <option value="default-ASC">A → Z</option>
              <option value="NAME_DESC">Z → A</option>
            </select>
          </div>

          {/* Book Count Sort */}
          <div className="w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Số lượng sách</label>
            <select
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none min-w-[150px]"
              value={sortConfig.key === 'books_count' ? sortConfig.direction : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setSortConfig({ key: 'books_count', direction: e.target.value });
                } else {
                  setSortConfig({ key: 'default', direction: 'ASC' });
                }
                setCurrentPage(1);
              }}
            >
              <option value="">Mặc định</option>
              <option value="ASC">Ít đến Nhiều</option>
              <option value="DESC">Nhiều đến Ít</option>
            </select>
          </div>

          {/* Birth Year Sort */}
          <div className="w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Năm sinh</label>
            <select
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none min-w-[150px]"
              value={sortConfig.key === 'birth_year' ? sortConfig.direction : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setSortConfig({ key: 'birth_year', direction: e.target.value });
                } else {
                  setSortConfig({ key: 'default', direction: 'ASC' });
                }
                setCurrentPage(1);
              }}
            >
              <option value="">Mặc định</option>
              <option value="ASC">Lớn tuổi đến trẻ</option>
              <option value="DESC">Trẻ đến lớn tuổi</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="w-full md:w-auto">
            <button
              onClick={() => {
                setSearch('');
                setSortConfig({ key: 'default', direction: 'ASC' });
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Số lượng sách</th>
                <th className="px-4 py-3">Năm sinh - Mất</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-4"><Loader2 className="animate-spin inline mr-2" /> Đang tải...</td></tr>
              ) : authors.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4">Không có tác giả nào</td></tr>
              ) : authors.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{a.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                      {a.books_count || 0} sách
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {a.birth_year || a.death_year ? (
                      <>
                        {a.birth_year}{a.birth_year && a.death_year ? ' - ' : ''}{a.death_year ? (a.birth_year ? a.death_year : `? - ${a.death_year}`) : ''}
                      </>
                    ) : ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(a)}
                        className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Sửa"
                        title="Chỉnh sửa quyền hạn"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        aria-label="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold">{editingAuthor ? 'Cập nhật tác giả' : 'Thêm tác giả mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên tác giả <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Năm sinh</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                    value={formData.birth_year}
                    onChange={e => setFormData({ ...formData, birth_year: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Năm mất</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                    value={formData.death_year}
                    onChange={e => setFormData({ ...formData, death_year: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-600"
                >
                  {editingAuthor ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
