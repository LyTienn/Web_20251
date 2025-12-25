import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Search, UserSquare, Bookmark, Heart, Plus, X, Trash2, Loader2 } from 'lucide-react';
import AdminUserService from '../../service/AdminUserService';
import BookshelfAdminService from '../../service/BookshelfAdminService';

function BookCard({ book, badgeIcon, onRemove }) {
  return (
    <div className="group relative flex flex-col gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-slate-200/50">
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onRemove} className="p-1 rounded-full bg-black/60 hover:bg-red-500 text-white backdrop-blur-sm transition-colors" title="Xóa khỏi danh sách">
          <X size={14} />
        </button>
      </div>
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

// Modal to search and select books
function AddBookModal({ isOpen, onClose, onAdd, status }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  // Debounced search could be better, but simple effect is okay for admin
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        // Call API to search books
        const AdminBookService = (await import('../../service/AdminBookService')).default;
        const res = await AdminBookService.getAllBooks({ q: searchTerm, limit: 10 });
        setBooks(res?.books || res?.data || []);
      } catch (err) {
        console.error("Failed to search books", err);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchBooks();
    }
  }, [isOpen, searchTerm]);

  if (!isOpen) return null;

  const handleAdd = async (book) => {
    try {
      setAddingId(book.id);
      await onAdd(book.id, status);
      onClose();
    } catch (err) {
      alert("Failed to add book: " + (err.response?.data?.message || err.message));
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold">
            Thêm vào {status === 'READING' ? 'sách đang đọc' : 'sách yêu thích'}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="w-full pl-9 pr-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
              placeholder="Tìm kiếm sách..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div>
          ) : books.length === 0 ? (
            <p className="text-center text-slate-500">Không tìm thấy sách</p>
          ) : (
            books.map(book => (
              <div key={book.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100">
                <img src={book.image_url || '/placeholder-book.png'} className="w-10 h-14 object-cover rounded bg-slate-200" alt="" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{book.title}</h4>
                  <p className="text-xs text-slate-500 truncate">{book.Author?.name || book.author || 'Unknown'}</p>
                </div>
                <button
                  onClick={() => handleAdd(book)}
                  disabled={addingId === book.id}
                  className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {addingId === book.id ? <Loader2 size={14} className="animate-spin" /> : 'Thêm'}
                </button>
              </div>
            ))
          )}
        </div>
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

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStatus, setAddStatus] = useState('READING'); // 'READING' | 'FAVORITE'

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

  // Remove book handler
  const handleRemove = useCallback(async (bookId, status) => {
    if (!selectedUserId) return;
    if (!window.confirm("Bạn có chắc muốn xóa sách này khỏi kệ?")) return;
    try {
      await BookshelfAdminService.removeFromUserBookshelf(selectedUserId, bookId, status);
      setLibrary((prev) => ({
        reading: status === 'READING' ? prev.reading.filter((b) => b.id !== bookId) : prev.reading,
        favorites: status === 'FAVORITE' ? prev.favorites.filter((b) => b.id !== bookId) : prev.favorites,
      }));
    } catch (err) {
      alert("Failed to remove: " + (err.response?.data?.message || err.message));
    }
  }, [selectedUserId]);

  // Open modal
  const openAddModal = (status) => {
    setAddStatus(status);
    setShowAddModal(true);
  };

  // Add book handler
  const handleAddBook = async (bookId, status) => {
    if (!selectedUserId) return;
    await BookshelfAdminService.addToUserBookshelf(selectedUserId, bookId, status);
    // Reload library to show new state
    await loadLibrary();
  };

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${selectedUser.full_name || selectedUser.email}"?`)) {
      try {
        await AdminUserService.deleteUser(selectedUser.user_id || selectedUser.id);
        // Remove from local list
        const remainingUsers = users.filter(u => u.user_id !== selectedUser.user_id);
        setUsers(remainingUsers);
        if (remainingUsers.length > 0) {
          setSelectedUserId(remainingUsers[0].user_id);
        } else {
          setSelectedUserId(null);
          setLibrary({ reading: [], favorites: [] });
        }
      } catch (err) {
        alert("Không thể xóa user: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="flex h-full bg-slate-50 relative">
      <AddBookModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddBook}
        status={addStatus}
      />

      {/* Left pane: user list */}
      <aside className="w-[300px] flex flex-col border-r border-slate-200 bg-white flex-shrink-0">
        <div className="p-4 border-b border-slate-200">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-primary">
              <Search size={18} />
            </div>
            <input
              className="block w-full p-3 pl-10 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none placeholder-slate-400 focus:bg-white transition-colors"
              placeholder="Tìm kiếm người dùng..."
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium transition-colors border border-transparent hover:border-red-100 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Xóa người dùng
                </button>
              </div>
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
                      <button
                        onClick={() => openAddModal('READING')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors shadow-sm"
                      >
                        <Plus size={18} />
                        Thêm sách đang đọc
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {library.reading.map((b) => (
                        <BookCard key={b.id} book={b} badgeIcon={<Bookmark size={16} />} onRemove={() => handleRemove(b.id, 'READING')} />
                      ))}
                      <button
                        onClick={() => openAddModal('READING')}
                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary/50 hover:bg-slate-50 transition-all aspect-[2/3] lg:aspect-auto lg:h-auto min-h-[240px]"
                      >
                        <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Plus size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-500 text-center">Thêm sách đang đọc</span>
                      </button>
                    </div>
                  </div>

                  {/* Favorites section */}
                  <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">Sách yêu thích</h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-xs font-bold text-slate-600">{library.favorites.length}</span>
                      </div>
                      <button
                        onClick={() => openAddModal('FAVORITE')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors shadow-sm"
                      >
                        <Heart size={18} className="text-red-500" />
                        Thêm sách yêu thích
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {library.favorites.map((b) => (
                        <BookCard key={b.id} book={b} badgeIcon={<Heart size={16} className="text-red-400" />} onRemove={() => handleRemove(b.id, 'FAVORITE')} />
                      ))}
                      <button
                        onClick={() => openAddModal('FAVORITE')}
                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary/50 hover:bg-slate-50 transition-all aspect-[2/3] lg:aspect-auto lg:h-auto min-h-[240px]"
                      >
                        <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Plus size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-500 text-center">Thêm sách yêu thích</span>
                      </button>
                    </div>
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
