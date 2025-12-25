import React from 'react';
import { Search, Filter, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import AdminUserService from '../../service/AdminUserService';

export default function Users() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Search & Filter State
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [tierFilter, setTierFilter] = React.useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalItems, setTotalItems] = React.useState(0);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [formData, setFormData] = React.useState({ role: 'USER', tier: 'FREE' });

  React.useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, search, roleFilter, tierFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        q: search,
        role: roleFilter,
        tier: tierFilter
      };

      const res = await AdminUserService.getAllUsers(params);

      if (res && res.users) {
        setUsers(res.users || []);
        setTotalPages(res.totalPages || 0);
        setTotalItems(res.total || 0);
      } else if (res && res.data && res.data.users) {
        // Handle inconsistent wrapping if legacy exists
        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalItems(res.data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      role: user.role || 'USER',
      tier: user.tier || 'FREE'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.")) {
      try {
        await AdminUserService.deleteUser(id);
        fetchUsers();
      } catch (error) {
        alert("Không thể xóa user: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await AdminUserService.updateUser(editingUser.user_id || editingUser.id, formData);
        fetchUsers();
        setShowModal(false);
      }
    } catch (error) {
      alert("Lỗi cập nhật: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <div className="p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Người dùng</h2>
          <p className="text-slate-500 dark:text-slate-400">Theo dõi và quản trị tài khoản người dùng.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            className="px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Tất cả Role</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            className="px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Tất cả Tier</option>
            <option value="FREE">Free</option>
            <option value="PREMIUM">Premium</option>
          </select>
        </div>
      </div>

      <div className="p-4">
        <div className="relative max-w-md mb-4">
          <input
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            placeholder="Tìm người dùng (Tên, Email)..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Hạng</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4">Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4">Không có dữ liệu</td></tr>
              ) : users.map((u) => (
                <tr key={u.user_id || u.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.full_name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.tier === 'PREMIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {u.tier || 'FREE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Sửa"
                        title="Chỉnh sửa quyền hạn"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.user_id || u.id)}
                        className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        aria-label="Xóa"
                        title="Xóa người dùng"
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

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold">Cập nhật người dùng: {editingUser?.full_name}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vai trò (Role)</label>
                <select
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="USER">User (Thành viên thường)</option>
                  <option value="ADMIN">Admin (Quản trị viên)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hạng thành viên (Tier)</label>
                <select
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  value={formData.tier}
                  onChange={e => setFormData({ ...formData, tier: e.target.value })}
                >
                  <option value="FREE">Free (Miễn phí)</option>
                  <option value="PREMIUM">Premium (Trả phí)</option>
                </select>
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
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
