import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/redux/Auth/AuthThunk';
import Search from './Search';
import { Button } from "@/components/ui/button";
import { BookOpen, User, LogOut, Library, LayoutDashboard, Zap, Settings, Crown, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'react-toastify';
import { setUser } from '@/redux/Auth/AuthSlice';

const HeaderBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lấy state auth
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Đăng xuất thành công!');
    navigate('/homepage');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getSubscriptionText = () => {
    if (!user) return "";
    if (user.role === "ADMIN") return "Quản trị viên";
    if (user.tier === "PREMIUM") {
      const pkg = user.package_details;

      if (pkg === "3_THANG") return "Hội viên 3 tháng";
      if (pkg === "6_THANG") return "Hội viên 6 tháng";
      if (pkg === "12_THANG") return "Hội viên 1 năm";

      return "Hội viên Premium";
    }
    return "Gói thường";
  };

  return (
    <header
      className={`border-b sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md border-slate-200" : "bg-white/50 backdrop-blur-sm border-transparent"
        }`}
    >
      <div className='container mx-auto h-16 px-4 flex items-center justify-between'>
        {/* LOGO */}
        <Link to="/" className='flex items-center gap-2 group'>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white transition-transform group-hover:scale-105 shadow-md shadow-blue-200">
            <BookOpen className='h-5 w-5' />
          </div>
          <span className='hidden font-serif text-xl font-bold text-slate-800 sm:block'>Thư Viện Sách</span>
        </Link>

        {/* SEARCH BAR - DESKTOP */}
        <div className="hidden flex-1 max-w-md mx-8 md:block">
          <Search variant="static" />
        </div>

        {/* NAVIGATION - DESKTOP */}
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/search')} className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
            Khám phá
          </Button>

          {/* Show Premium Button if not premium or guest */}
          {(!isAuthenticated || (user && user.tier !== "PREMIUM" && user.role !== "ADMIN")) && (
            <Button
              variant="ghost"
              onClick={() => navigate('/membership')}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Premium
            </Button>
          )}

          {isAuthenticated ? (
            <>
              {user?.role !== "admin" && user?.tier === "PREMIUM" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/membership')}
                  className="hidden sm:flex border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100"
                >
                  <Crown className='h-4 w-4 mr-2 text-amber-600' />
                  {getSubscriptionText()}
                </Button>
              )}

              {user?.role === "admin" && (
                <Link to="/admin/users">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Quản trị
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 pl-2 pr-2 hover:bg-slate-100 flex items-center gap-2 rounded-full border border-transparent hover:border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span
                      className="font-medium max-w-[100px] truncate text-slate-700 hidden lg:block"
                      title={user?.fullName || user?.full_name}
                    >
                      {user?.fullName || user?.full_name || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">
                      Gói: <span className="font-medium text-slate-700">{getSubscriptionText()}</span>
                    </span>
                  </DropdownMenuItem>
                  {user?.tier === "FREE" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/membership")}
                      className="cursor-pointer hover:bg-amber-50 text-amber-700 font-semibold"
                    >
                      <Zap className="h-4 w-4 mr-2 text-amber-500" />
                      Nâng cấp ngay
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />

                  {user?.role !== "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/bookshelf")} className="cursor-pointer hover:bg-gray-100">
                      <Library className="h-4 w-4 mr-2" />
                      Tủ sách
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer hover:bg-gray-100">
                    <Settings className="h-4 w-4 mr-2" />
                    Quản lý tài khoản
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')} className="hover:bg-slate-100">
                Đăng nhập
              </Button>
              <Button onClick={() => navigate('/register')} className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 hover:shadow-xl transition-all">
                Đăng ký
              </Button>
            </>
          )}
        </nav>

        {/* MOBILE MENU BUTTON */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Search Icon (opens expanded mode or just navigates) - simplified to standard search component in dynamic mode if needed, but here we put it in menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-600"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMenuOpen && (
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur-xl md:hidden absolute top-16 left-0 right-0 shadow-xl animate-in slide-in-from-top-2 p-4 flex flex-col gap-4">
          <div className="relative">
            <Search variant="static" className="w-full" />
          </div>

          <nav className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start" onClick={() => { navigate('/search'); setIsMenuOpen(false); }}>
              <BookOpen className="mr-2 h-4 w-4" /> Khám phá
            </Button>

            {isAuthenticated ? (
              <>
                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>
                  <User className="mr-2 h-4 w-4" /> Tài khoản: {user?.fullName || "User"}
                </Button>
                <Button variant="ghost" className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="justify-start" onClick={() => { navigate('/login'); setIsMenuOpen(false); }}>
                  <User className="mr-2 h-4 w-4" /> Đăng nhập
                </Button>
                <Button className="justify-start bg-slate-900 text-white" onClick={() => { navigate('/register'); setIsMenuOpen(false); }}>
                  Đăng ký ngay
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default HeaderBar;