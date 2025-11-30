import { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      </Suspense>
    </div>
  )
}

function AppContent() {
  return (
    <Routes>
      {/* <Route path='/' element={<Login />} /> */}
      <Route path='/*' element={<MainLayout />} />
    </Routes>
  )
}

function App() {
 return (
  <Router>
    <AppContent />
  </Router>
 ) 
}
export default App;