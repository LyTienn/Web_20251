import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HomePage = lazy(() => import('./pages/HomePage'));
const Read = lazy(() => import('./pages/Read'));

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Routes>
          <Route path="/homepage/*" element={<HomePage />} />       
          <Route path="*" element={<HomePage />} />
          <Route path="/book/:id/read" element={<Read />} />
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