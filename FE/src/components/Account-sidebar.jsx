import { useLocation, useNavigate } from "react-router-dom";
import { User, Library, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const menuItems = [
  {
    id: "profile",
    label: "Quản lý tài khoản",
    icon: User,
    href: "/profile",
  },
  {
    id: "bookshelf",
    label: "Tủ sách cá nhân",
    icon: Library,
    href: "/bookshelf",
  },
  {
    id: "transactions",
    label: "Lịch sử giao dịch",
    icon: History,
    href: "/transactions",
  },
];

export function AccountSidebar() {
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const pathname = location.pathname; 
  const { user } = useSelector((state) => state.auth);
  const [userTier, setUserTier] = useState(user?.tier);

  useEffect(() => {
    setUserTier(user?.tier);
  }, [user?.tier]);

  return (
    <div className="w-68 h-full bg-linear-to-b from-white via-slate-50 to-slate-100 bg-card/30 pt-6 pb-4 px-4 flex flex-col gap-2 shadow-sm">
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-primary mb-2">
          <User className="w-8 h-8" />
        </div>
        <span className="font-semibold text-lg">{user?.fullName || user?.full_name}</span>
        <span className="text-xs mt-1 px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-medium">
          {userTier === "PREMIUM" ? "Hội viên Premium" : "Hội viên thường"}
        </span>
        {userTier === "FREE" && (
          <button
            className="mt-2 px-3 py-1 rounded bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition"
            onClick={() => navigate("/membership")}
          >
            Nâng cấp ngay
          </button>
        )}
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isActive ? "bg-gray-100 text-primary" : "text-foreground hover:bg-gray-100 hover:text-foreground"}`}
                onClick={() => navigate(item.href)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}