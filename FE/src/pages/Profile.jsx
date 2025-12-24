import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Lock, Trash2, Save, Loader2, AlertTriangle } from "lucide-react";
import Header from "@/components/HeaderBar";
import { AccountSidebar } from "@/components/Account-sidebar"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import axios from "@/config/Axios-config";
import { fetchUserProfile } from "@/redux/Auth/AuthThunk";
import { setUser } from "@/redux/Auth/AuthSlice";

export default function ProfilePage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State cho form Profile
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // State cho form Password
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loadingPass, setLoadingPass] = useState(false);

  // State cho Delete Account
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load dữ liệu user ban đầu vào form
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user) {
      setProfileData({
        fullName: user.fullName || user.full_name || "", 
        email: user.email || "",
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await axios.put("/users/profile", {
        fullName: profileData.fullName,
        email: profileData.email
      });
        if (res.success || res.data?.success) {
          const updatedUser = res.data?.user || res.data?.data?.user || res.user;
          if (updatedUser) {
            dispatch(setUser(updatedUser));
            setProfileData({
              fullName: updatedUser.fullName || updatedUser.full_name || "",
              email: updatedUser.email || "",
            });
          }
          dispatch(fetchUserProfile());
          toast.success("Cập nhật hồ sơ thành công");
        }
    } catch (error) {
        console.error("Lỗi chi tiết:", error);
        toast.error(error.response?.data?.message || "Lỗi cập nhật hồ sơ");
    } finally {
        setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (passData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setLoadingPass(true);
    try {
      const res = await axios.post("/users/change-password", {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });

      if (res.success || res.data?.success) {
        toast.success("Đổi mật khẩu thành công");
        setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Mật khẩu hiện tại không đúng");
    } finally {
      setLoadingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.warn("Vui lòng nhập mật khẩu để xác nhận");
      return;
    }

    try {
      const res = await axios.delete("/users/account", {
        data: { password: deletePassword }
      });

      if (res.success || res.data?.success) {
        toast.success("Tài khoản đã được xóa. Hẹn gặp lại!");
        window.location.href = "/login"; 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Mật khẩu không đúng hoặc lỗi server");
    }
  };

  if (!isAuthenticated) return null;

  return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            <Header />
            
            <main className="flex-1 flex overflow-hidden">
                
                {/* Sidebar cố định */}
                <div className="shrink-0">
                    <AccountSidebar />
                </div>

                {/* Content tự cuộn */}
                <div className="flex-1 overflow-y-auto bg-background/50">
                    <div className="container mx-auto px-8 py-8 max-w-6xl space-y-8 pb-20">
                        
                        {/* Tiêu đề trang */}
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <User className="h-8 w-8" /> Quản lý tài khoản
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Cập nhật thông tin cá nhân và bảo mật
                            </p>
                        </div>

                        {/* --- FORM 1: THÔNG TIN CÁ NHÂN --- */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin cá nhân</CardTitle>
                                <CardDescription>Thông tin hiển thị công khai của bạn</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="fullName">Họ và tên</Label>
                                        <Input 
                                            id="fullName" 
                                            value={profileData.fullName}
                                            onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                                            placeholder="Tên hiển thị"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input 
                                            id="email" 
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={loadingProfile} className="hover:bg-gray-100">
                                            {loadingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Lưu thay đổi
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* --- FORM 2: ĐỔI MẬT KHẨU --- */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" /> Đổi mật khẩu
                                </CardTitle>
                                <CardDescription>Bảo vệ tài khoản bằng mật khẩu mạnh</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Mật khẩu hiện tại</Label>
                                        <Input 
                                            type="password"
                                            value={passData.currentPassword}
                                            onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Mật khẩu mới</Label>
                                            <Input 
                                                type="password"
                                                value={passData.newPassword}
                                                onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                                                placeholder="Min 6 ký tự"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Xác nhận mật khẩu</Label>
                                            <Input 
                                                type="password"
                                                value={passData.confirmPassword}
                                                onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" variant="outline" disabled={loadingPass} className="hover:bg-gray-100">
                                            Đổi mật khẩu
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* --- FORM 3: XÓA TÀI KHOẢN --- */}
                        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                            <CardHeader>
                                <CardTitle className="text-red-600 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" /> Vùng nguy hiểm
                                </CardTitle>
                                <CardDescription className="text-red-600/80">
                                    Hành động này không thể hoàn tác
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-red-600">
                                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="w-full sm:w-auto hover:bg-gray-200">
                                            <Trash2 className="mr-2 h-4 w-4 text-red-600" /> Xóa tài khoản vĩnh viễn
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Xác nhận xóa tài khoản?</DialogTitle>
                                            <DialogDescription>
                                                Nhập mật khẩu của bạn để xác nhận hành động này. Dữ liệu sẽ mất vĩnh viễn.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Input
                                                type="password"
                                                placeholder="Nhập mật khẩu của bạn"
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" className="hover:bg-gray-200" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                                            <Button variant="destructive" className="hover:bg-gray-200" onClick={handleDeleteAccount}>
                                                Xác nhận xóa
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </main>
        </div>
    );
}