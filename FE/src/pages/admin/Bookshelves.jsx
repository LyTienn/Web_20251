import React from 'react';
import { Plus, Pencil, Trash2, BookMarked } from 'lucide-react';

export default function Bookshelves() {
  const data = [
    { id: 1, name: 'Phổ biến', visibility: 'Công khai', count: 250 },
    { id: 2, name: 'Mới phát hành', visibility: 'Công khai', count: 120 },
    { id: 3, name: 'Bản thảo', visibility: 'Nội bộ', count: 40 }
  ];

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Kệ sách</h2>
          <p className="text-slate-500 dark:text-slate-400">Thiết lập kệ sách hệ thống.</p>
        </div>
        <button className="px-3 py-2 text-sm rounded-md bg-primary text-white flex items-center gap-2">
          <Plus size={16} />
          Tạo kệ sách
        </button>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Tên kệ</th>
              <th className="px-4 py-3">Hiển thị</th>
              <th className="px-4 py-3">Số sách</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {data.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <BookMarked size={16} />
                    {s.name}
                  </div>
                </td>
                <td className="px-4 py-3">{s.visibility}</td>
                <td className="px-4 py-3">{s.count}</td>
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
  );
}
