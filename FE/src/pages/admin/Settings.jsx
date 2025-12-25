import React, { useState } from 'react';
import {
  User,
  BellRing,
  Shield,
  SlidersHorizontal,
  Camera,
  Edit3,
  Lock,
  KeyRound,
  Save
} from 'lucide-react';

export default function Settings() {
  const [profile, setProfile] = useState({
    name: 'Nguyễn Văn Admin',
    phone: '0909 123 456',
    email: 'admin@thuvienso.com'
  });
  const [security, setSecurity] = useState({ current: '', next: '', confirm: '' });
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyModeration, setNotifyModeration] = useState(false);

  const onChange = (field, value) => setProfile((p) => ({ ...p, [field]: value }));
  const onSecurity = (field, value) => setSecurity((s) => ({ ...s, [field]: value }));

  const onSave = () => {
    // TODO: integrate with backend endpoints (profile, settings)
    console.log({ profile, security, notifyEmail, notifyModeration });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-8 py-6 pb-2 shrink-0">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Cài đặt Hệ thống</h1>
            <p className="text-slate-500 dark:text-slate-400">Quản lý thông tin tài khoản và cấu hình chung cho hệ thống thư viện số.</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-8 shrink-0 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0B1218]">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex gap-8">
            <a className="flex items-center gap-2 border-b-2 border-primary text-primary px-1 pb-3 pt-4" href="#">
              <User size={18} />
              <span className="text-sm font-bold">Tài khoản</span>
            </a>
            <a className="flex items-center gap-2 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 px-1 pb-3 pt-4 transition-all" href="#">
              <BellRing size={18} />
              <span className="text-sm font-bold">Thông báo</span>
            </a>
            <a className="flex items-center gap-2 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 px-1 pb-3 pt-4 transition-all" href="#">
              <Shield size={18} />
              <span className="text-sm font-bold">Quyền truy cập</span>
            </a>
            <a className="flex items-center gap-2 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 px-1 pb-3 pt-4 transition-all" href="#">
              <SlidersHorizontal size={18} />
              <span className="text-sm font-bold">Hệ thống</span>
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto w-full pb-20 space-y-8">
          {/* Avatar section */}
          <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group cursor-pointer">
                <div
                  className="size-24 rounded-full bg-cover bg-center border-4 border-slate-100 dark:border-slate-700"
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDuMYt-uhp8SRknPOPvwa36CwVun18ci93GGwPqdSb-SLSWwqEZVqGUJEAeigVzx3-fORJOe8C9IITQfRiY2q-vS2F21Hzrl9OtzgbkX81F2QFNdslQKEI7p-r97i_nTBLLZ_1HH0nFfENnbG8xYB_Td-SSngMriBY69dUmAwBaEnQH89JTmTMwObZT9K7KhH198PggEc03kwW4qocSeRFYfQ9eh9tRx07YmhWp0AEc12Vdk1fc3LAcLZWjAglr-MT-sMnByU6J')` }}
                />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={18} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Administrator</h2>
                  <p className="text-slate-500 dark:text-slate-400">admin@thuvienso.com</p>
                  <div className="mt-3 flex gap-3">
                    <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">Tải ảnh lên</button>
                    <button className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Xóa</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Personal info */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Edit3 className="text-primary" size={18} />
              Thông tin cá nhân
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Họ và tên</label>
                  <div className="relative">
                    <input className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-400" type="text" value={profile.name} onChange={(e) => onChange('name', e.target.value)} />
                    <Edit3 className="absolute right-3 top-2.5 text-slate-400" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Số điện thoại</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-400" type="text" value={profile.phone} onChange={(e) => onChange('phone', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email đăng nhập</label>
                  <div className="relative">
                    <input className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 dark:text-slate-400 cursor-not-allowed" disabled type="email" value={profile.email} />
                    <Lock className="absolute right-3 top-2.5 text-slate-400" size={18} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Email không thể thay đổi. Vui lòng liên hệ bộ phận kỹ thuật nếu cần hỗ trợ.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="text-primary" size={18} />
              Bảo mật
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-400" placeholder="••••••••" type="password" value={security.current} onChange={(e) => onSecurity('current', e.target.value)} />
                </div>
                <div className="hidden md:block"></div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="password" value={security.next} onChange={(e) => onSecurity('next', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Xác nhận mật khẩu mới</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="password" value={security.confirm} onChange={(e) => onSecurity('confirm', e.target.value)} />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button className="text-primary hover:text-blue-400 text-sm font-bold flex items-center gap-1">
                  <KeyRound size={16} />
                  Quên mật khẩu?
                </button>
              </div>
            </div>
          </section>

          {/* Quick notifications */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BellRing className="text-primary" size={18} />
              Cài đặt nhanh thông báo
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
              <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Thông báo email</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Nhận email khi có người dùng mới đăng ký</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Kiểm duyệt nội dung</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Thông báo khi có bình luận bị báo cáo</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifyModeration} onChange={(e) => setNotifyModeration(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky footer actions */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1218] p-4 px-8">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline-block">Lần cập nhật cuối: 14:30 hôm nay</span>
          <div className="flex gap-4">
            <button className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Hủy bỏ</button>
            <button onClick={onSave} className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center gap-2">
              <Save size={16} />
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
