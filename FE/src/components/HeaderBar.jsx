import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/redux/Auth/AuthThunk';
import Search from './Search';
import { Button } from "@/components/ui/button";
import { BookOpen, User, LogOut, Library, LayoutDashboard, Zap, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HeaderBar = ({ searchData, onSearchResult }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Lấy state auth
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/homepage'); 
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // gói dịch vụ (Sửa thêm các gói nếu có trong tương lai)
  const getSubscriptionText = () => {
    if (!user) return "";
    if (user.role === "admin") return "Quản trị viên";
    if (user.role === "member") return "Hội viên"; 
    // Mặc định cho user thường
    return "Gói thường";
  };

  return (
    <header
      className={`border-b sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <Link to="/" className='flex items-center gap-2 font-semibold text-lg'>
          <BookOpen className='h-6 w-6' />
          <span>Thư Viện Sách</span>
        </Link>
        
        <nav className="flex items-center gap-4">

          <Search data={searchData} onResult={onSearchResult}/>
          
          { isAuthenticated ? (
            <>
              { user?.role !== "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/subscriptions')}
                  className = "hidden sm:flex border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                >
                  <Zap className='h-4 w-4 mr-2 fill-yellow-500' />
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
                  <Button variant="ghost" size="sm" className="h-8 pl-2 pr-2 hover:bg-gray-200">
                    <User className="h-4 w-4 mr-2" />
                    <span className="font-medium">{user?.fullName || "User"}</span>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">
                      Gói hiện tại: <span className="font-medium text-slate-700">{getSubscriptionText()}</span>
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  
                  {user?.role !== "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/bookshelf")} className="cursor-pointer hover:bg-gray-200">
                      <Library className="h-4 w-4 mr-2" />
                      Tủ sách
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer hover:bg-gray-200">
                    <Settings className="h-4 w-4 mr-2" />
                    Quản lý tài khoản
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {user?.role !== "member" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/membership")} className="cursor-pointer hover:bg-gray-200">
                        Trở thành hội viên
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hover:bg-slate-200">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );  
}

export default HeaderBar;