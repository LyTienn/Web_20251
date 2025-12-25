import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tag, Loader2, X } from 'lucide-react';
import AdminSubjectService from '../../service/AdminSubjectService';
import Pagination from '../../components/admin/Pagination';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  // Pagination & Search
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, search]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        q: search
      };
      const res = await AdminSubjectService.getAllSubjects(params);
      if (res && res.subjects) {
        setSubjects(res.subjects || []);
        setTotalPages(res.totalPages || 0);
      } else if (Array.isArray(res)) {
        setSubjects(res);
      }
    } catch (error) {
      console.error("Failed to fetch subjects", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenModal = (subject = null) => {
    setEditingSubject(subject);
    if (subject) {
      setFormData({ name: subject.name });
    } else {
      setFormData({ name: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await AdminSubjectService.updateSubject(editingSubject.id, formData);
      } else {
        await AdminSubjectService.createSubject(formData);
      }
      setShowModal(false);
      fetchSubjects();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có muốn xóa chủ đề này?")) {
      try {
        await AdminSubjectService.deleteSubject(id);
        fetchSubjects();
      } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <div className="p-6 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Chủ đề</h2>
          <p className="text-slate-500 dark:text-slate-400">Tổ chức chủ đề cho sách.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-3 py-2 text-sm rounded-md bg-primary text-white flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          Thêm chủ đề
        </button>
      </div>

      <div className="p-4">
        {/* Search Bar */}
        <div className="relative max-w-sm mb-4">
          <input
            type="text"
            className="w-full pl-3 pr-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 text-sm"
            placeholder="Tìm kiếm chủ đề..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : subjects.length === 0 ? (
          <div className="text-center p-8 text-slate-500">Chưa có chủ đề nào</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((s) => (
              <div key={s.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-slate-500" />
                    <span className="font-medium text-slate-900 dark:text-white">{s.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(s)}
                      className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                      aria-label="Sửa"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      aria-label="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold">{editingSubject ? 'Cập nhật chủ đề' : 'Thêm chủ đề mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên chủ đề <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
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
                  {editingSubject ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
