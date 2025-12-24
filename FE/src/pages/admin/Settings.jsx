import React from 'react';
import { Save } from 'lucide-react';

export default function Settings() {
  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
        <h2 className="text-xl font-semibold">Cài đặt</h2>
        <p className="text-slate-500 dark:text-slate-400">Cấu hình hệ thống và quyền truy cập.</p>
      </div>
      <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Chế độ giao diện</label>
          <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
            <option>Hệ thống</option>
            <option>Sáng</option>
            <option>Tối</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Yêu cầu kiểm duyệt bình luận</label>
          <select className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
            <option>Tất cả</option>
            <option>Chỉ người lạ</option>
            <option>Không</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Thông báo hệ thống</label>
          <textarea className="w-full h-24 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" placeholder="Nội dung thông báo..." />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button type="button" className="px-4 py-2 rounded-md bg-primary text-white flex items-center gap-2">
            <Save size={16} />
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
