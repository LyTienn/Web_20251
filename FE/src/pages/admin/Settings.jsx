import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Edit3,
  Lock,
  Save,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import AuthService from '../../service/AuthService';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullName: '',
    email: ''
  });
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setInitialLoading(true);
      const res = await AuthService.getProfile();
      if (res && res.data && res.data.user) {
        setProfile({
          fullName: res.data.user.full_name || '',
          email: res.data.user.email || ''
        });
      }
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await AuthService.updateProfile({ fullName: profile.fullName });
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    if (security.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu phải từ 6 ký tự trở lên.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await AuthService.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword
      });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // Optional: Logout after password change
      setTimeout(async () => {
        await AuthService.logout();
        navigate('/login');
      }, 2000);

    } catch (error) {
      const msg = error.response?.data?.message || 'Đổi mật khẩu thất bại.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-8 py-6 pb-2 shrink-0">
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Cài đặt Tài khoản</h1>
            <p className="text-slate-500 dark:text-slate-400">Quản lý thông tin cá nhân và bảo mật.</p>
          </div>
        </div>
      </header>

      {/* Tabs (Visual only now since we reduced scope) */}
      <div className="px-8 shrink-0 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0B1218]">
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex gap-8">
            <div className="flex items-center gap-2 border-b-2 border-primary text-primary px-1 pb-3 pt-4">
              <User size={18} />
              <span className="text-sm font-bold">Thông tin chung</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto w-full pb-20 space-y-8">

          {/* Status Message */}
          {message.text && (
            <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
              {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Personal info */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Edit3 className="text-primary" size={18} />
              Thông tin cá nhân
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Họ và tên</label>
                  <div className="relative">
                    <input
                      id="settings-fullname"
                      name="fullName"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-400"
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                    <Edit3 className="absolute right-3 top-2.5 text-slate-400" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email đăng nhập</label>
                  <div className="relative">
                    <input
                      id="settings-email"
                      name="email"
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      disabled
                      type="email"
                      value={profile.email}
                    />
                    <Lock className="absolute right-3 top-2.5 text-slate-400" size={18} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Email không thể thay đổi.</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Lưu thông tin
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="text-primary" size={18} />
              Đổi mật khẩu
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</label>
                  <input
                    id="current-password"
                    name="currentPassword"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    type="password"
                    value={security.currentPassword}
                    onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
                  <input
                    id="new-password"
                    name="newPassword"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    type="password"
                    value={security.newPassword}
                    onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Xác nhận mật khẩu mới</label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
