import React from 'react';
import { Search, Filter, Pencil, Trash2, ShieldCheck } from 'lucide-react';

export default function Users() {
  const data = [
    { id: 1, name: 'Nguyễn Văn Hùng', email: 'hung.nguyen@email.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Trần Thị Lan', email: 'lan.tran@email.com', role: 'User', status: 'Pending' },
    { id: 3, name: 'Lê Minh', email: 'minh.le@email.com', role: 'User', status: 'Active' }
  ];

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Người dùng</h2>
          <p className="text-slate-500 dark:text-slate-400">Theo dõi và quản trị tài khoản người dùng.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 text-sm rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center gap-2">
            <Filter size={16} />
            Bộ lọc
          </button>
          <button className="px-3 py-2 text-sm rounded-md bg-green-600 text-white flex items-center gap-2">
            <ShieldCheck size={16} />
            Phân quyền
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="relative max-w-md mb-4">
          <input className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" placeholder="Tìm người dùng..." />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {data.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Sửa">
                        <Pencil size={16} />
                      </button>
                      <button className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400" aria-label="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
