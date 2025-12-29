import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IntroHero() {
    const navigate = useNavigate();
    const headingRef = useRef(null);
    const videoContainerRef = useRef(null);
    const videoRef = useRef(null);
    const contentRef = useRef(null);
    const textLeftRef = useRef(null);
    const textRightRef = useRef(null);

    // State to handle completion of animation to show interaction buttons
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            onComplete: () => setAnimationComplete(true)
        });

        // Initial setup
        gsap.set([textLeftRef.current, textRightRef.current], { opacity: 0 });
        gsap.set(videoContainerRef.current, {
            scale: 0,
            rotation: 8
        });

        const getGap = () => {
            const vw = window.innerWidth;
            if (vw <= 480) return "55vw";
            if (vw <= 768) return "25vw";
            if (vw <= 1024) return "30vw";
            return "20vw";
        };

        // Animation Sequence
        tl.to([textLeftRef.current, textRightRef.current], {
            opacity: 1,
            duration: 0.5,
            delay: 0.2,
        })
            // Open the gap between texts
            .to(headingRef.current, {
                gap: getGap(),
                duration: 1,
            }, "<0.5")
            // Reveal video in the gap
            .to(videoContainerRef.current, {
                scale: 1,
                rotation: 8,
                duration: 1,
            }, "<")
            // Rotate back and expand
            .to(videoContainerRef.current, {
                rotation: 0,
                width: "100%",
                height: "100%",
                duration: 1.5,
                ease: "power2.inOut"
            }, "+=0.2")
            // Fade out and blur the text as video expands
            .to([textLeftRef.current, textRightRef.current], {
                opacity: 0,
                filter: "blur(10px)",
                duration: 1,
            }, "<")
            // Scale video inside container
            .to(videoRef.current, {
                scale: 1.1, // Slight zoom effect
                duration: 1.5,
            }, "<")
            // Reveal Main Content overlay
            .fromTo(contentRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                "-=0.5"
            );

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div className="relative h-[600px] md:h-[700px] w-full overflow-hidden bg-[#FAF0ED] flex justify-center items-center">

            {/* Background Loading/Splitting Text Layer */}
            <div
                ref={headingRef}
                className="absolute z-10 flex items-center justify-center gap-2 uppercase font-light text-slate-900 pointer-events-none"
                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
                <h2 ref={textLeftRef} className='whitespace-nowrap'>Thư Viện</h2>
                <h2 ref={textRightRef} className='whitespace-nowrap'>Sách AI</h2>
            </div>

            {/* Video Container */}
            <div
                ref={videoContainerRef}
                className="relative overflow-hidden w-[15vw] h-[20vw] z-0"
                style={{ borderRadius: animationComplete ? '0' : '1rem' }}
            >
                <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover transform scale-150"
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source src="https://de-puydt.b-cdn.net/de-puydt-moodfilm-compressed.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Main Content Overlay (appears after animation) */}
            <div
                ref={contentRef}
                className="absolute inset-0 z-20 container mx-auto px-6 md:px-12 flex flex-col justify-center items-start text-white opacity-0"
            >
                <div className="max-w-3xl pt-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
                        <Crown className="h-4 w-4 text-yellow-400" />
                        <span className="uppercase tracking-wider">Trải nghiệm tương lai</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        Khám phá <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                            Tri thức nhân loại
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
                        Nền tảng đọc sách tích hợp AI tiên tiến nhất. Tóm tắt, dịch thuật, và chuyển đổi giọng nói chỉ trong một chạm.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => document.getElementById('books-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-full hover:bg-blue-50 transition-all hover:scale-105"
                        >
                            Bắt đầu ngay
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => navigate('/search')}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 backdrop-blur-sm transition-all"
                        >
                            Tìm sách
                        </button>
                    </div>
                </div>
            </div>
            {/* Bottom Fade Gradient for smooth transition */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-30 pointer-events-none" />
        </div>
    );
}
