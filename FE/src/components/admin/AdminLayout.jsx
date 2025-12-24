import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
  Menu,
  Search,
  Bell
} from 'lucide-react';

function SidebarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          isActive
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

export default function AdminLayout() {
  return (
    <div className="font-display bg-slate-50 dark:bg-[#0B1218] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="relative flex min-h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111418] h-screen sticky top-0">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 px-2">
                <div className="bg-center bg-no-repeat bg-cover rounded-md h-10 w-10 bg-primary flex items-center justify-center text-white font-bold text-xl">
                  L
                </div>
                <div className="flex flex-col">
                  <h1 className="text-slate-900 dark:text-white text-base font-bold leading-normal">Thư viện số</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal">Admin Portal</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1 mt-2">
                <SidebarLink to="/admin" icon={{ node: <LayoutDashboard size={18} /> }} label="Dashboard" />
                <div className="group">
                  <div className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <Library size={18} />
                      <span className="text-sm font-medium">Quản lý Tài liệu</span>
                    </div>
                    <span className="text-sm"><Tag size={14} className="opacity-0" /></span>
                  </div>
                  <div className="pl-10 pr-2 flex flex-col gap-1 mt-1 border-l border-slate-200 dark:border-slate-800 ml-4">
                    <SidebarLink to="/admin/books" icon={{ node: <Library size={16} /> }} label="Sách" />
                    <SidebarLink to="/admin/authors" icon={{ node: <UsersIcon size={16} /> }} label="Tác giả" />
                    <SidebarLink to="/admin/subjects" icon={{ node: <Tag size={16} /> }} label="Chủ đề" />
                    <SidebarLink to="/admin/bookshelves" icon={{ node: <BookMarked size={16} /> }} label="Kệ sách" />
                  </div>
                </div>
                <SidebarLink to="/admin/users" icon={{ node: <UsersIcon size={16} /> }} label="Quản lý Người dùng" />
                <SidebarLink to="/admin/registrations" icon={{ node: <UserCheck size={16} /> }} label="Quản lý Đăng ký" />
                <SidebarLink to="/admin/comments" icon={{ node: <MessageSquareMore size={16} /> }} label="Kiểm duyệt Bình luận" />
                <SidebarLink to="/admin/settings" icon={{ node: <SettingsIcon size={16} /> }} label="Cài đặt" />
              </nav>
            </div>
            <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4 px-2">
              <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors" href="#">
                <LogOut size={16} />
                <span className="text-sm font-medium">Đăng xuất</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between gap-4">
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Menu size={18} />
            </button>
            <div className="flex-1 max-w-xl">
              <div className="relative flex items-center w-full h-10 rounded-lg focus-within:ring-2 focus-within:ring-primary/50 bg-white dark:bg-[#1C252E] overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="grid place-items-center h-full w-12 text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  className="peer h-full w-full outline-none text-sm text-slate-700 dark:text-slate-200 pr-2 bg-transparent placeholder-slate-400"
                  placeholder="Tìm kiếm sách, thành viên hoặc dữ liệu..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <Bell size={18} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-[#101922]"></span>
              </button>
              <button className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">A</div>
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
