import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Admin imports
import AdminLayout from './components/admin/AdminLayout';
import RequireAdmin from './components/admin/RequireAdmin';
import Dashboard from './pages/admin/Dashboard';
import Books from './pages/admin/Books';
import Authors from './pages/admin/Authors';
import Subjects from './pages/admin/Subjects';
import Bookshelves from './pages/admin/Bookshelves';
import Users from './pages/admin/Users';
import Registrations from './pages/admin/Registrations';
import CommentsModeration from './pages/admin/CommentsModeration';
import Settings from './pages/admin/Settings';

const HomePage = lazy(() => import('./pages/HomePage'));
const Read = lazy(() => import('./pages/Read'));
const BookSection = lazy(() => import('./components/BookSection'));
const BookShelf = lazy(() => import('./pages/BookShelf'));
const Profile = lazy(() => import('./pages/Profile'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Membership = lazy(() => import('./pages/Membership'));

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Routes>
          <Route path="/homepage/*" element={<HomePage />} />       
          <Route path="*" element={<HomePage />} />
          <Route path="/book/:id/read" element={<Read />} />
          <Route path="/book/:id" element={<BookSection />} />
          <Route path="/bookshelf" element={<BookShelf />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/membership" element={<Membership />} />
        </Routes>
      </Suspense>
    </div>
  )
}

function AppContent() {
  return (
    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      {/* Admin routes */}
      <Route path='/admin' element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Dashboard />} />
        <Route path='books' element={<Books />} />
        <Route path='authors' element={<Authors />} />
        <Route path='subjects' element={<Subjects />} />
        <Route path='bookshelves' element={<Bookshelves />} />
        <Route path='users' element={<Users />} />
        <Route path='registrations' element={<Registrations />} />
        <Route path='comments' element={<CommentsModeration />} />
        <Route path='settings' element={<Settings />} />
      </Route>
      <Route path='/*' element={<MainLayout />} />
    </Routes>
  )
}

function App() {
 return (
    <>
      <AppContent />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
 ) 
}
export default App;