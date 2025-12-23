import { useLocation, useNavigate } from "react-router-dom";
import { User, Library, History } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="w-64 h-full border-r border-border bg-card/30 pt-6 pb-4 px-4 flex flex-col gap-2">
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