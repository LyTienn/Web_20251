import { useState, useCallback, useRef, useEffect } from 'react';
import './App.css'
import ListSection from '../components/ListSection'
import BookSection from '../components/BookSection';
import HeaderBar from '../components/HeaderBar';
import { useWindowSize } from './useWindowSize';

function App() {
  // Breakpoints
  const { width } = useWindowSize();
  const isSmallScreen = width < 1024;

  // State cho mobile view
  const [activePanel, setActivePanel] = useState('list');

  // State cho desktop view
  const MIN_WIDTH = 30;
  const MAX_WIDTH = 70;
  const [listWidth, setListWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const mainContainerRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !mainContainerRef.current) return;

    const containerRect = mainContainerRef.current.getBoundingClientRect();
    const newWidthPx = e.clientX - containerRect.left; // Vị trí chuột so với container
    const newWidthPercent = (newWidthPx / containerRect.width) * 100;

    const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidthPercent));

    setListWidth(clampedWidth);
  }, [isDragging]);

  // Thêm và xóa event listener trên window
  useEffect(() => {
    // Chỉ kích hoạt kéo thả trên màn hình lớn
    if (isDragging && !isSmallScreen) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isSmallScreen, handleMouseMove, handleMouseUp]);

  // Render cho Mobile và Tablet
  if (isSmallScreen) {
    return (
      <div className="app-container">
        <header className="header-bar">
          <HeaderBar/>
        </header>
        <main className="main-content">
          {activePanel === 'list' ? <div className="section-content"><ListSection /></div> : <div className="section-content"><BookSection /></div>}
        </main>
        <footer className="footer-bar">
          <div className="mobile-nav">
            <button onClick={() => setActivePanel('list')} className={activePanel === 'list' ? 'active' : ''} title="List Section">☰</button>
            <button onClick={() => setActivePanel('book')} className={activePanel === 'book' ? 'active' : ''} title="Book Section">📖</button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header-bar">
        <HeaderBar />
      </div>
      {/* Render cho Desktop */}
      <main ref={mainContainerRef} className="main-content" style={{ userSelect: isDragging ? 'none' : 'auto' }}>
        <div 
          className={`list-section ${isDragging ? 'no-transition' : ''}`} 
          style={{ width: `${listWidth}%`, position: 'relative' }}
        >
          {listWidth < MAX_WIDTH && (
            <button onClick={() => setListWidth(MAX_WIDTH)} className="maximize-btn" title="Phóng to" style={{right: 8, top: 8}}>
              &#x25A1; {/* Square symbol */}
            </button>
          )}
          <div className="section-content">
            <ListSection />
          </div>
          
        </div>
        
        {/* Chỉ hiển thị thanh chia trên Desktop */}
        <div className="divider" onMouseDown={handleMouseDown}></div>

        <div 
          className={`book-section ${isDragging ? 'no-transition' : ''}`} 
          style={{ width: `calc(100% - ${listWidth}% - 8px)`, position: 'relative' }}
        >
          {listWidth > MIN_WIDTH && (
            <button onClick={() => setListWidth(MIN_WIDTH)} className="maximize-btn" title="Phóng to" style={{ left: 8, top: 8 }}>
              &#x25A1; {/* Square symbol */}
            </button>
          )}
          <div className="section-content">
            <BookSection />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
