import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Search, UserSquare, Bookmark, Heart, Loader2 } from 'lucide-react';
import AdminUserService from '../../service/AdminUserService';
import BookshelfAdminService from '../../service/BookshelfAdminService';

function BookCard({ book, badgeIcon }) {
  return (
    <div className="group relative flex flex-col gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-slate-200/50">
      <div className="aspect-[2/3] w-full rounded-lg bg-slate-200 overflow-hidden relative">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={book.title} src={book.image_url || book.cover || '/placeholder-book.png'} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-slate-900 text-sm font-semibold line-clamp-1" title={book.title}>
          {book.title}
        </h4>
        <p className="text-slate-500 text-xs line-clamp-1">
          {book.Author?.name || (typeof book.author === 'object' ? book.author?.name : book.author) || 'Unknown'}
        </p>
      </div>
      <div className="absolute left-2 top-2 p-1 bg-black/40 rounded backdrop-blur-sm text-white/90">
        {badgeIcon}
      </div>
    </div>
  );
}

export default function Bookshelves() {
  const [filter, setFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [library, setLibrary] = useState({ reading: [], favorites: [] });
  const [loading, setLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(false);

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const result = await AdminUserService.getAllUsers({ page: 1, limit: 100 });
        const userList = result?.users || [];
        setUsers(userList);
        if (userList.length > 0) {
          setSelectedUserId(userList[0].user_id);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Load library when user changes
  const loadLibrary = useCallback(async () => {
    if (!selectedUserId) return;
    try {
      setLibraryLoading(true);
      const data = await BookshelfAdminService.getUserLibrary(selectedUserId);
      setLibrary({ reading: data?.reading || [], favorites: data?.favorites || [] });
    } catch (err) {
      console.error('Failed to load library:', err);
      setLibrary({ reading: [], favorites: [] });
    } finally {
      setLibraryLoading(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Search/filter users
  const filteredUsers = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return users;
    return users.filter((u) => (u.full_name || '').toLowerCase().includes(f) || u.email.toLowerCase().includes(f) || u.user_id.includes(f));
  }, [filter, users]);

  const selectedUser = users.find((u) => u.user_id === selectedUserId);

  return (
    <div className="flex h-full bg-slate-50 relative">
      {/* Left pane: user list */}
      <aside className="w-[300px] flex flex-col border-r border-slate-200 bg-white flex-shrink-0">
        <div className="p-4 border-b border-slate-200">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-primary">
              <Search size={18} />
            </div>
            <input
              id="bookshelf-user-search"
              name="bookshelf-user-search"
              className="block w-full p-3 pl-10 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none placeholder-slate-400 focus:bg-white transition-colors"
              placeholder="Tìm kiếm người dùng..."
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Tìm kiếm người dùng"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Không tìm thấy người dùng</p>
          ) : (
            filteredUsers.map((u) => {
              const isActive = u.user_id === selectedUserId;
              return (
                <button
                  key={u.user_id}
                  onClick={() => setSelectedUserId(u.user_id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer group transition-all relative overflow-hidden border ${isActive ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-transparent'
                    }`}
                >
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-transparent pointer-events-none" />}
                  {isActive && <div className="w-1 absolute left-0 top-0 bottom-0 bg-primary" />}
                  <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                    {(u.full_name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 z-10 text-left">
                    <h3 className={`text-sm truncate ${isActive ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>{u.full_name || u.email}</h3>
                    <p className={`${isActive ? 'text-primary' : 'text-slate-400'} text-xs font-medium truncate`}>{u.email}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Right pane: library */}
      <section className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        {selectedUser ? (
          <>
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserSquare className="text-primary" size={18} />
                <span>Thư viện của {selectedUser.full_name || selectedUser.email}</span>
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              {libraryLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : (
                <>
                  {/* Reading section */}
                  <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">Sách đang đọc</h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-xs font-bold text-slate-600">{library.reading.length}</span>
                      </div>
                    </div>
                    {library.reading.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {library.reading.map((b) => (
                          <BookCard key={b.id} book={b} badgeIcon={<Bookmark size={16} />} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm italic">Chưa có sách nào trong danh sách đang đọc.</p>
                    )}
                  </div>

                  {/* Favorites section */}
                  <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">Sách yêu thích</h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-xs font-bold text-slate-600">{library.favorites.length}</span>
                      </div>
                    </div>
                    {library.favorites.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {library.favorites.map((b) => (
                          <BookCard key={b.id} book={b} badgeIcon={<Heart size={16} className="text-red-400" />} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm italic">Chưa có sách nào trong danh sách yêu thích.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            Chọn người dùng để xem thư viện
          </div>
        )}
      </section>
    </div>
  );
}
