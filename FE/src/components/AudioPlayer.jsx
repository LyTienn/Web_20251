import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, X, Loader2, Volume2, Settings } from "lucide-react";
import axios from "@/config/Axios-config";
import { toast } from "react-toastify";
import { useProgress } from "@/contexts/ProgressContext";

const AudioPlayer = ({ text, onClose, autoPlay = false, chapterId, bookTitle, chapterTitle }) => {
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Progress State
    const [progress, setProgress] = useState(null); // { current: 0, total: 0, stage: '' }
    const [taskId, setTaskId] = useState(null);

    const audioRef = useRef(null);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const pollingRef = useRef(null);
    const { addTask, updateTask, removeTask } = useProgress();

    useEffect(() => {
        fetchVoices();
        return () => {
            if (pollingRef.current) clearTimeout(pollingRef.current);
        };
    }, [chapterId]);

    const fetchVoices = async () => {
        try {
            const url = chapterId ? `/tts/voices?chapterId=${chapterId}` : "/tts/voices";
            const res = await axios.get(url);
            const voiceList = Array.isArray(res) ? res : (res.voices || []);

            if (voiceList.length > 0) {
                setVoices(voiceList);
                // Don't auto-select to force user choice or keep null
            }
        } catch (error) {
            console.error("Failed to load voices", error);
            toast.error("Không thể tải danh sách giọng đọc");
        }
    };

    const pollTask = async (tId) => {
        try {
            const res = await axios.get(`/tasks/${tId}`);
            const task = res.data || res;

            if (task.progress) {
                setProgress(task.progress);
            }

            if (task.status === 'COMPLETED') {
                if (task.result && task.result.audioUrl) {
                    playAudio(task.result.audioUrl);
                    toast.success("Đã tạo xong audio!");

                    // Refresh voice list to mark as available
                    await fetchVoices();
                } else {
                    toast.error("Lỗi: Không tìm thấy URL audio.");
                }
                setIsLoading(false);
                setTaskId(null);
                setProgress(null);

                // Update global progress tracker
                updateTask(tId, { status: 'COMPLETED' });
                // Auto-remove after 3 seconds
                setTimeout(() => removeTask(tId), 3000);
                return;
            }

            if (task.status === 'FAILED') {
                toast.error(`Lỗi tạo audio: ${task.error || 'Unknown error'}`);
                setIsLoading(false);
                setTaskId(null);
                setProgress(null);

                // Update global progress tracker
                updateTask(tId, { status: 'FAILED', error: task.error });
                return;
            }

            // Update progress in global tracker
            if (task.progress) {
                setProgress(task.progress);
                updateTask(tId, { progress: task.progress, status: task.status });
            }

            // Continue polling
            pollingRef.current = setTimeout(() => pollTask(tId), 2000);

        } catch (error) {
            console.error("Polling error:", error);
        }
    };

    const handleGenerate = async (voice) => {
        if (!text) return;

        setIsLoading(true);
        setSelectedVoice(voice); // Track which voice is being generated
        setProgress({ current: 0, total: 100, stage: 'init' });

        try {
            const response = await axios.post("/tts/speak", {
                text: text,
                voiceName: voice.name,
                chapterId: chapterId || null
            });

            const data = response.data || response;

            if (data.taskId) {
                setTaskId(data.taskId);

                // Add to global progress tracker
                addTask({
                    id: data.taskId,
                    type: 'TTS',
                    bookTitle: bookTitle || 'Unknown Book',
                    chapterTitle: chapterTitle || 'Unknown Chapter',
                    voiceName: voice.name,
                    progress: { current: 0, total: 100, stage: 'init' },
                    status: 'PENDING'
                });

                pollTask(data.taskId);
            } else if (data.audioUrl) {
                playAudio(data.audioUrl);
                setIsLoading(false);
                setProgress(null);
            }

        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi gửi yêu cầu.");
            setIsLoading(false);
            setProgress(null);
        }
    };

    const playAudio = (url) => {
        if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.playbackRate = playbackRate;
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handlePlayAvailable = (voice) => {
        if (voice.audioUrl) {
            // Only change source if different
            if (selectedVoice?.name !== voice.name) {
                setSelectedVoice(voice);
                playAudio(voice.audioUrl);
            } else if (audioRef.current.paused) {
                audioRef.current.play();
                setIsPlaying(true);
            } else {
                // already playing this voice, maybe toggle pause handled by toggle btn
            }
        }
    };

    const togglePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white shadow-2xl border border-slate-200 w-96 rounded-xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="bg-slate-50 border-b p-3 flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-blue-600" />
                    Đọc sách AI
                </h3>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
                        <Settings className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-500" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

                {/* Progress Indicator */}
                {isLoading && progress && (
                    <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="flex justify-between text-xs font-medium text-blue-700 mb-1">
                            <span>
                                {progress.stage === 'uploading' ? 'Đang tải lên Cloud...' :
                                    progress.stage === 'processing' ? `Đang xử lý: ${progress.current}/${progress.total} đoạn` :
                                        'Đang khởi tạo...'}
                            </span>
                            {progress.total > 0 && progress.stage === 'processing' && (
                                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                            )}
                        </div>
                        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{
                                    width: progress.stage === 'uploading' ? '100%' :
                                        progress.total ? `${(progress.current / progress.total) * 100}%` : '5%'
                                }}
                            />
                        </div>
                        <p className="text-[10px] text-blue-500 mt-1 italic text-center">
                            Vui lòng đợi, quá trình này có thể mất vài phút với chương dài.
                        </p>
                    </div>
                )}

                {/* Voice List */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">Chọn giọng đọc:</h4>
                    {voices.map(voice => (
                        <div key={voice.name} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${selectedVoice?.name === voice.name ? 'border-blue-400 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}>
                            <div>
                                <div className="font-medium text-slate-800">{voice.name}</div>
                                <div className="text-xs text-slate-500">{voice.description}</div>
                            </div>

                            <div>
                                {voice.isAvailable ? (
                                    <Button
                                        size="sm"
                                        variant={isPlaying && selectedVoice?.name === voice.name ? "default" : "outline"}
                                        className={`h-8 px-3 gap-1 ${isPlaying && selectedVoice?.name === voice.name ? 'bg-blue-600 text-white' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                                        onClick={() => voice.name === selectedVoice?.name && isPlaying ? togglePlayPause() : handlePlayAvailable(voice)}
                                    >
                                        {isPlaying && selectedVoice?.name === voice.name ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                        {isPlaying && selectedVoice?.name === voice.name ? "Dừng" : "Phát"}
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 px-3 text-slate-600 bg-slate-100 hover:bg-slate-200"
                                        disabled={isLoading}
                                        onClick={() => handleGenerate(voice)}
                                    >
                                        {isLoading && selectedVoice?.name === voice.name ? <Loader2 className="h-3 w-3 animate-spin" /> : "Tạo"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer / Controls (only visible when playing) */}
            <div className="border-t p-3 bg-slate-50">
                {showSettings && (
                    <div className="mb-3 p-2 bg-white rounded border animate-in slide-in-from-bottom-2">
                        <label htmlFor="playback-rate" className="block text-xs text-slate-500 mb-1">Tốc độ đọc: {playbackRate}x</label>
                        <input
                            id="playback-rate"
                            name="playback-rate"
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.25"
                            value={playbackRate}
                            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            aria-label="Tốc độ đọc"
                        />
                    </div>
                )}

                <audio
                    ref={audioRef}
                    onEnded={() => setIsPlaying(false)}
                    onError={() => {
                        setIsPlaying(false);
                        if (audioRef.current && audioRef.current.src) toast.error("Lỗi phát audio");
                    }}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default AudioPlayer;
