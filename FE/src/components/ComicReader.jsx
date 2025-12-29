import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, LayoutGrid, Smartphone, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

const ComicReader = ({ comicData, onClose, isOpen }) => {
    const [mode, setMode] = useState('vertical'); // 'vertical' | 'horizontal'
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoom, setZoom] = useState(1);



    const handleNext = () => {
        if (currentIndex < comicData.length - 1) setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    const handleKeyDown = (e) => {
        if (mode === 'horizontal') {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, currentIndex]);

    if (!comicData || comicData.length === 0) return null;

    const sortedData = [...comicData].sort((a, b) => a.order - b.order);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-slate-950 border-slate-800 flex flex-col overflow-hidden">
                {/* Header Control */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-white font-bold text-lg hidden sm:block">Truyện tranh</h2>
                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                            <button
                                onClick={() => setMode('vertical')}
                                className={`p-1.5 rounded-md transition-colors ${mode === 'vertical' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                title="Đọc dọc (Scroll)"
                            >
                                <Smartphone className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setMode('horizontal')}
                                className={`p-1.5 rounded-md transition-colors ${mode === 'horizontal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                title="Đọc ngang (Slide)"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                        </div>
                        <span className="text-slate-400 text-sm">
                            {mode === 'horizontal' ? `${currentIndex + 1}/${sortedData.length}` : `${sortedData.length} trang`}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-slate-950 relative flex justify-center">
                    {mode === 'vertical' ? (
                        <div className="max-w-2xl w-full py-8 px-4 space-y-8">
                            {sortedData.map((page, index) => (
                                <div key={index} className="flex flex-col items-center gap-3">
                                    <img
                                        src={page.url}
                                        alt={`Page ${index + 1}`}
                                        className="w-full h-auto rounded-sm shadow-2xl border border-slate-800"
                                        loading="lazy"
                                    />
                                    <p className="text-slate-400 text-sm font-medium text-center italic opacity-80 max-w-lg">
                                        {page.caption || `Trang ${index + 1}`}
                                    </p>
                                </div>
                            ))}
                            <div className="text-center text-slate-600 py-10">--- Hết ---</div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
                            {/* Navigation Buttons for Horizontal Mode */}
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-blue-600 transition disabled:opacity-30 disabled:hover:bg-black/50 backdrop-blur-sm"
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={currentIndex === sortedData.length - 1}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-blue-600 transition disabled:opacity-30 disabled:hover:bg-black/50 backdrop-blur-sm"
                            >
                                <ChevronRight className="h-8 w-8" />
                            </button>

                            <div className="relative max-h-full max-w-full flex flex-col items-center justify-center">
                                <img
                                    src={sortedData[currentIndex].url}
                                    alt={`Page ${currentIndex + 1}`}
                                    className="max-h-[80vh] w-auto object-contain rounded-md shadow-2xl border border-slate-800"
                                />
                                <p className="mt-4 text-slate-300 text-center font-medium max-w-2xl bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                                    {sortedData[currentIndex].caption || `Trang ${currentIndex + 1}`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ComicReader;
