import { useProgress } from '@/contexts/ProgressContext';
import { Button } from '@/components/ui/button';
import { X, Minimize2, Maximize2, Headphones, Sparkles, Loader2, Globe, Palette } from 'lucide-react';
import { useState } from 'react';

const GlobalProgressTracker = () => {
    const { activeTasks, removeTask } = useProgress();
    const [minimizedTasks, setMinimizedTasks] = useState(new Set());

    if (activeTasks.length === 0) return null;

    const toggleMinimize = (taskId) => {
        setMinimizedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const getProgressPercent = (progress) => {
        if (!progress || !progress.total) return 0;
        return Math.round((progress.current / progress.total) * 100);
    };

    const getProgressText = (progress) => {
        if (!progress) return 'Đang khởi tạo...';
        if (progress.stage === 'uploading') return 'Đang tải lên Cloud...';
        if (progress.stage === 'processing') return `Đang xử lý: ${progress.current}/${progress.total} đoạn`;
        return 'Đang khởi tạo...';
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
            {activeTasks.map(task => {
                const isMinimized = minimizedTasks.has(task.id);

                let icon = <Sparkles className="h-4 w-4" />;
                let title = 'Đang tạo tóm tắt';
                let bgColor = 'bg-purple-50 border-purple-200';
                let iconColor = 'text-purple-600';
                let progressColor = 'bg-purple-600';

                if (task.type === 'TTS') {
                    icon = <Headphones className="h-4 w-4" />;
                    title = `Đang tạo giọng đọc: ${task.voiceName || 'Unknown'}`;
                    bgColor = 'bg-blue-50 border-blue-200';
                    iconColor = 'text-blue-600';
                    progressColor = 'bg-blue-600';
                } else if (task.type === 'TRANSLATE') {
                    icon = <Globe className="h-4 w-4" />;
                    title = 'Đang dịch thuật';
                    bgColor = 'bg-green-50 border-green-200';
                    iconColor = 'text-green-600';
                    progressColor = 'bg-green-600';
                } else if (task.type === 'COMIC') {
                    icon = <Palette className="h-4 w-4" />;
                    title = 'Đang vẽ truyện tranh';
                    bgColor = 'bg-orange-50 border-orange-200';
                    iconColor = 'text-orange-600';
                    progressColor = 'bg-orange-600';
                }

                if (isMinimized) {
                    return (
                        <div
                            key={task.id}
                            onClick={() => toggleMinimize(task.id)}
                            className={`${bgColor} cursor-pointer hover:shadow-lg transition-all rounded-full px-4 py-2 flex items-center gap-2 shadow-md border`}
                        >
                            {icon}
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-xs font-medium">{task.progress ? `${getProgressPercent(task.progress)}%` : '...'}</span>
                        </div>
                    );
                }

                return (
                    <div
                        key={task.id}
                        className={`${bgColor} rounded-lg p-4 shadow-lg border animate-in slide-in-from-bottom-2`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                                <div className={iconColor}>{icon}</div>
                                <span className="font-semibold text-sm">{title}</span>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => toggleMinimize(task.id)}
                                >
                                    <Minimize2 className="h-3 w-3" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => removeTask(task.id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="text-sm text-slate-700 mb-3 space-y-1">
                            <div className="font-medium truncate">{task.bookTitle || 'Unknown Book'}</div>
                            <div className="text-xs text-slate-500 truncate">{task.chapterTitle || 'Unknown Chapter'}</div>
                        </div>

                        {task.status === 'COMPLETED' ? (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Hoàn thành!</span>
                            </div>
                        ) : task.status === 'FAILED' ? (
                            <div className="text-red-600 text-sm">
                                <span>❌ Lỗi: {task.error || 'Unknown error'}</span>
                            </div>
                        ) : task.progress ? (
                            <div>
                                <div className="flex justify-between text-xs mb-1 text-slate-600">
                                    <span>{getProgressText(task.progress)}</span>
                                    <span className="font-medium">{getProgressPercent(task.progress)}%</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${progressColor} transition-all duration-300`}
                                        style={{ width: `${getProgressPercent(task.progress)}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Đang khởi tạo...</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GlobalProgressTracker;
