import React from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';

export default function Subjects() {
  const data = [
    { id: 1, name: 'Khoa học', count: 450 },
    { id: 2, name: 'Văn học', count: 320 },
    { id: 3, name: 'Kinh tế', count: 150 },
    { id: 4, name: 'Lịch sử', count: 100 }
  ];

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Chủ đề</h2>
          <p className="text-slate-500 dark:text-slate-400">Tổ chức chủ đề cho sách.</p>
        </div>
        <button className="px-3 py-2 text-sm rounded-md bg-primary text-white flex items-center gap-2">
          <Plus size={16} />
          Thêm chủ đề
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((s) => (
          <div key={s.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-slate-500" />
                <span className="font-medium text-slate-900 dark:text-white">{s.name}</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Sửa">
                  <Pencil size={16} />
                </button>
                <button className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400" aria-label="Xóa">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-500">{s.count} đầu sách</p>
          </div>
        ))}
      </div>
    </div>
  );
}
