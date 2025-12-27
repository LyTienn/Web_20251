import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, X, Loader2, Volume2, Settings } from "lucide-react";
import axios from "@/config/Axios-config";
import { toast } from "react-toastify";

const AudioPlayer = ({ text, onClose, autoPlay = false }) => {
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);

    useEffect(() => {
        // Fetch voices
        const fetchVoices = async () => {
            try {
                const res = await axios.get("/tts/voices");
                const voiceList = Array.isArray(res) ? res : (res.voices || []);

                if (voiceList.length > 0) {
                    setVoices(voiceList);
                    // Default to Kore or text description suggestion
                    const defaultVoice = voiceList.find(v => v.name === "Kore") || voiceList[0];
                    setSelectedVoice(defaultVoice.name);
                }
            } catch (error) {
                console.error("Failed to load voices", error);
                toast.error("Không thể tải danh sách giọng đọc");
            }
        };
        fetchVoices();
    }, []);

    const handlePlay = async () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        if (audioRef.current && audioRef.current.src) {
            audioRef.current.play();
            setIsPlaying(true);
            return;
        }

        if (!selectedVoice || !text) return;

        try {
            setIsLoading(true);
            const response = await axios.post("/tts/speak", {
                text: text,
                voiceName: selectedVoice, // Updated param name
                chapterId: null // We might not have chapterId freely available here unless prop passed, but controller handles null
            });

            if ((response && response.audioUrl) || (response && response.url)) { // Handle both just in case
                if (audioRef.current) {
                    audioRef.current.src = response.audioUrl || response.url;
                    audioRef.current.playbackRate = playbackRate;
                    audioRef.current.play();
                    setIsPlaying(true);
                }
            } else {
                toast.error("Không nhận được URL audio");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tạo giọng đọc");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceChange = (e) => {
        setSelectedVoice(e.target.value);
        // Reset audio if voice changes
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-xl border border-slate-200 w-80 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-blue-600" />
                    Đọc sách AI
                </h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
                onError={() => {
                    setIsPlaying(false);
                    toast.error("Lỗi phát audio");
                }}
            />

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handlePlay}
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                            isPlaying ? <Pause className="h-4 w-4 fill-current" /> :
                                <Play className="h-4 w-4 fill-current" />}
                        <span className="ml-2">{isPlaying ? 'Tạm dừng' : 'Phát'}</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>

                {showSettings && (
                    <div className="space-y-3 bg-slate-50 p-3 rounded text-sm">
                        <div>
                            <label className="block text-slate-600 mb-1">Giọng đọc</label>
                            <select
                                className="w-full p-2 border rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={selectedVoice}
                                onChange={handleVoiceChange}
                            >
                                {voices.map(v => (
                                    <option key={v.name} value={v.name}>
                                        {v.name} - {v.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-600 mb-1">Tốc độ ({playbackRate}x)</label>
                            <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.25"
                                value={playbackRate}
                                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioPlayer;
