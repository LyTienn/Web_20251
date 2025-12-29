import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Library,
  Tag,
  BookMarked,
  Users as UsersIcon,
  UserCheck,
  MessageSquareMore,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import AuthService from '../../service/AuthService';

function SidebarLink({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`
      }
    >
      {icon?.node ? (
        <span className="text-slate-700 dark:text-slate-300">{icon.node}</span>
      ) : null}
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
}

function SidebarContent({ isDocumentsOpen, setIsDocumentsOpen, handleLogout, closeMobileMenu }) {
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2">
          <div className="text-slate-900 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
          </div>
          <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-normal">Thư Viện Sách</h1>
        </div>
        <nav className="flex flex-col gap-1 mt-2">
          <SidebarLink to="/admin" icon={{ node: <LayoutDashboard size={18} /> }} label="Dashboard" onClick={closeMobileMenu} />
          <div className="group">
            <button
              onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Library size={18} />
                <span className="text-sm font-medium">Quản lý Tài liệu</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isDocumentsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDocumentsOpen && (
              <div className="pl-10 pr-2 flex flex-col gap-1 mt-1 border-l border-slate-200 dark:border-slate-800 ml-4 animate-in slide-in-from-top-2 duration-200">
                <SidebarLink to="/admin/books" icon={{ node: <Library size={16} /> }} label="Sách" onClick={closeMobileMenu} />
                <SidebarLink to="/admin/authors" icon={{ node: <UsersIcon size={16} /> }} label="Tác giả" onClick={closeMobileMenu} />
                <SidebarLink to="/admin/subjects" icon={{ node: <Tag size={16} /> }} label="Chủ đề" onClick={closeMobileMenu} />
                <SidebarLink to="/admin/bookshelves" icon={{ node: <BookMarked size={16} /> }} label="Kệ sách" onClick={closeMobileMenu} />
              </div>
            )}
          </div>
          <SidebarLink to="/admin/users" icon={{ node: <UsersIcon size={16} /> }} label="Quản lý Người dùng" onClick={closeMobileMenu} />
          <SidebarLink to="/admin/registrations" icon={{ node: <UserCheck size={16} /> }} label="Quản lý Đăng ký" onClick={closeMobileMenu} />
          <SidebarLink to="/admin/comments" icon={{ node: <MessageSquareMore size={16} /> }} label="Kiểm duyệt Bình luận" onClick={closeMobileMenu} />
          <SidebarLink to="/admin/analytics" icon={{ node: <BarChart3 size={16} /> }} label="Bình luận theo Sách" onClick={closeMobileMenu} />
          <SidebarLink to="/admin/settings" icon={{ node: <SettingsIcon size={16} /> }} label="Cài đặt" onClick={closeMobileMenu} />
        </nav>
      </div>
      <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4 px-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="font-display bg-slate-50 dark:bg-[#0B1218] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="relative flex min-h-screen w-full overflow-hidden">

        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-[#111418] border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open text-slate-900 dark:text-white"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            <h1 className="text-slate-900 dark:text-white text-lg font-bold">Thư Viện Sách</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-[#111418] border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="flex items-center justify-end p-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          <SidebarContent
            isDocumentsOpen={isDocumentsOpen}
            setIsDocumentsOpen={setIsDocumentsOpen}
            handleLogout={handleLogout}
            closeMobileMenu={closeMobileMenu}
          />
        </aside>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111418] h-screen sticky top-0">
          <SidebarContent
            isDocumentsOpen={isDocumentsOpen}
            setIsDocumentsOpen={setIsDocumentsOpen}
            handleLogout={handleLogout}
            closeMobileMenu={() => { }}
          />
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto">
          {/* Content - Add top padding on mobile for fixed header */}
          <div className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full pt-20 lg:pt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
