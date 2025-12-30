import { useState, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ListSection from '../components/ListSection';
import HeaderBar from '../components/HeaderBar';
import axios from '@/config/Axios-config';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Headphones,
  MessageCircle,
  Crown,
  ArrowRight,
  TrendingUp,
  Library,
  Users,
  Star
} from 'lucide-react';
import IntroHero from '../components/IntroHero';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [premiumBooks, setPremiumBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ books: 0, authors: 0, users: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/books', { params: { limit: 50 } });
        if (response.success && response.data) {
          const booksSource = response.data.books || (Array.isArray(response.data) ? response.data : []);

          const normalizedData = booksSource.map(book => ({
            ...book,
            imageUrl: book.imageUrl || book.image_url || 'https://placehold.co/150x220?text=No+Image',
            author: typeof book.author === 'object' ? book.author?.name : book.author
          }));
          setAllBooks(normalizedData);
          setFilteredBooks(normalizedData);
          setPremiumBooks(normalizedData.filter(b => b.is_premium).slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await axios.get('/public/stats');
        if (response.success && response.data) {
          setStats({
            books: response.data.books || 0,
            users: response.data.users || 0,
            authors: response.data.authors || 0,
            avgRating: response.data.avgRating || "4.5",
            totalReads: response.data.totalReads || 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchBooks();
    fetchStats();
  }, []);



  useLayoutEffect(() => {
    if (loading) return;

    let ctx = gsap.context(() => {
      // Stats Section
      gsap.fromTo(".gsap-stats-card",
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".gsap-stats-section",
            start: "top 85%",
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out"
        }
      );

      // Features Section
      gsap.fromTo(".gsap-feature-card",
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".gsap-features-section",
            start: "top 80%",
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out"
        }
      );

      // Premium Section
      if (document.querySelector(".gsap-premium-section")) {
        gsap.fromTo(".gsap-premium-section",
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: ".gsap-premium-section",
              start: "top 80%",
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
          }
        );

        gsap.fromTo(".gsap-premium-card",
          { y: 30, opacity: 0 },
          {
            scrollTrigger: {
              trigger: ".gsap-premium-section",
              start: "top 70%",
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.out",
            delay: 0.2
          }
        );
      }

      // All Books Header
      gsap.fromTo(".gsap-all-books-header",
        { opacity: 0, y: 20 },
        {
          scrollTrigger: {
            trigger: "#books-section",
            start: "top 85%"
          },
          opacity: 1,
          y: 0,
          duration: 0.8
        }
      );

      // CTA Section
      gsap.fromTo(".gsap-cta-content",
        { scale: 0.95, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".gsap-cta-section",
            start: "top 70%"
          },
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power2.out"
        }
      );

      ScrollTrigger.refresh();
    });
    return () => ctx.revert();
  }, [loading, premiumBooks]); // Re-run when data loads

  const handleSearchResult = (results) => {
    setFilteredBooks(results || allBooks);
  };

  const handleSelectBook = (book) => {
    if (book && book.id) {
      navigate(`/book/${book.id}`);
    }
  };

  // Features data
  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Tóm tắt AI",
      description: "Sử dụng công nghệ AI tiên tiến để tóm tắt nội dung sách, giúp bạn nắm bắt ý chính chỉ trong vài phút.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "Đọc sách bằng giọng nói",
      description: "Chuyển đổi văn bản thành giọng nói tự nhiên, đa dạng ngôn ngữ và cảm xúc, giúp bạn nghe sách mọi lúc mọi nơi.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Chatbot Thư viện",
      description: "Trợ lý ảo thông minh sẵn sàng giải đáp mọi thắc mắc về sách, tác giả và gợi ý sách phù hợp với sở thích của bạn.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Truyện tranh AI",
      description: "Biến những trang sách chữ thành những khung hình truyện tranh sinh động với hình ảnh minh họa độc đáo được tạo bởi AI.",
      color: "from-orange-500 to-rose-600"
    }
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <BookOpen className="h-16 w-16 text-blue-600 animate-pulse mx-auto" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full animate-ping mx-auto" />
          </div>
          <p className="mt-4 text-lg text-slate-600 font-medium">Đang tải thư viện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      <HeaderBar searchData={allBooks} onSearchResult={handleSearchResult} />

      {/* Hero Section */}
      <IntroHero />

      {/* Stats Section */}
      <section className="relative py-12 z-10 gsap-stats-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: <Library className="h-6 w-6" />, value: stats.books, label: "Đầu sách" },
              { icon: <Users className="h-6 w-6" />, value: stats.users, label: "Người dùng" },
              { icon: <Star className="h-6 w-6" />, value: stats.avgRating || "4.5", label: "Đánh giá" },
              { icon: <TrendingUp className="h-6 w-6" />, value: stats.totalReads, label: "Lượt tải" },
            ].map((stat, index) => {
              const formatNumber = (num) => {
                if (!num) return "0";
                if (typeof num === 'string') return num; // For ratings like "4.5"
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
                if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
                return num.toLocaleString();
              };

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 text-center hover:shadow-2xl transition-shadow gsap-stats-card"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-slate-900 truncate px-2" title={typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}>
                    {formatNumber(stat.value)}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-linear-to-br from-white to-slate-50 gsap-features-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tính năng <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">nổi bật</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Trải nghiệm đọc sách thế hệ mới với các công nghệ AI tiên tiến
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => navigate('/search')}
                className="group relative bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer gsap-feature-card"
              >
                <div className="absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-5 transition-opacity" style={{ background: `linear-gradient(135deg, ${feature.color.split(' ')[0].replace('from-', '')} 0%, ${feature.color.split(' ')[1].replace('to-', '')} 100%)` }} />
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Books Section */}
      {premiumBooks.length > 0 && (
        <section className="py-16 bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 gsap-premium-section">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-yellow-400 to-orange-500 rounded-xl text-white">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Sách Premium</h2>
                  <p className="text-slate-600 text-sm md:text-base">Trải nghiệm nội dung độc quyền, không quảng cáo và chất lượng cao dành riêng cho thành viên.</p>
                </div>
              </div>
              <Link
                to="/search?premium=true"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-amber-600 font-medium hover:bg-amber-50 transition-colors border border-amber-200"
              >
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {premiumBooks.slice(0, 6).map(book => (
                <div
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  className="group cursor-pointer gsap-premium-card"
                >
                  <div className="relative rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                    <img
                      src={book.imageUrl || book.image_url}
                      alt={book.title}
                      className="w-full aspect-2/3 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-linear-to-r from-yellow-400 to-orange-500 text-xs font-bold text-white rounded-full">
                        PREMIUM
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{book.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Books Section */}
      <main id="books-section" className="container mx-auto px-4 py-16">
        <div className="mb-8 gsap-all-books-header text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Thư viện sách</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Khám phá kho tàng tri thức vô tận với hàng ngàn đầu sách đa dạng thể loại, từ văn học kinh điển đến sách chuyên ngành cập nhật mới nhất.</p>
        </div>
        <ListSection books={filteredBooks} onSelectBook={handleSelectBook} />
      </main>

      <section className="relative py-24 overflow-hidden gsap-cta-section">
        {/* Transition Fade from preceding white section */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-linear-to-b from-white to-transparent z-10 pointer-events-none" />

        {/* Abstract Background */}
        <div className="absolute inset-0 bg-slate-900 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto gsap-cta-content">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-12 text-center">
              {/* Shining Effect */}
              <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-linear-to-br from-yellow-400 to-amber-600 shadow-lg shadow-orange-500/20 mb-8 group-hover:scale-110 transition-transform duration-500">
                <Crown className="h-10 w-10 text-white" />
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Nâng cấp trải nghiệm <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-200 via-amber-200 to-yellow-200 animate-gradient">
                  Premium Member
                </span>
              </h2>

              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Mở khóa toàn bộ kho sách AI, tính năng Text-to-Speech không giới hạn
                và trải nghiệm đọc sách không quảng cáo.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/membership"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-yellow-400 to-amber-600 text-white font-bold rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <Crown className="h-5 w-5" />
                  Xem các gói Premium
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Tạo tài khoản miễn phí
                </Link>
              </div>

              {/* Decorative elements */}
              <div className="hidden md:block absolute top-1/2 left-10 -translate-y-1/2 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
              <div className="hidden md:block absolute top-1/2 right-10 -translate-y-1/2 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">Thư Viện Sách</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nền tảng đọc sách số thông minh với công nghệ AI tiên tiến
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Khám phá</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><span onClick={() => navigate('/search')} className="hover:text-white transition-colors cursor-pointer">Tìm kiếm sách</span></li>
                <li><span onClick={() => navigate('/search')} className="hover:text-white transition-colors cursor-pointer">Thể loại</span></li>
                <li><span onClick={() => navigate('/search')} className="hover:text-white transition-colors cursor-pointer">Tác giả</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tính năng</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><span onClick={() => navigate('/search')} className="hover:text-white transition-colors cursor-pointer">Tóm tắt AI</span></li>
                <li><span onClick={() => navigate('/search')} className="hover:text-white transition-colors cursor-pointer">Text-to-Speech</span></li>
                <li><span onClick={() => navigate('/search')} className="hover:text-white transition-colors cursor-pointer">Chatbot</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tài khoản</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Đăng nhập</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Đăng ký</Link></li>
                <li><Link to="/membership" className="hover:text-white transition-colors">Gói Premium</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>© 2024 Thư Viện Sách. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;