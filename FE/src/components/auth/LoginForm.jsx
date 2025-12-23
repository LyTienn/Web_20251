import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { clearAuthError } from "@/redux/Auth/AuthSlice";
import { loginUser } from "../../redux/Auth/AuthThunk";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoading } = useSelector((state) => state.auth);

    // useEffect(() => {
    //     if (isAuthenticated) {
    //         navigate("/"); 
    //     }
    //     dispatch(clearAuthError());
    // }, [isAuthenticated, navigate, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!email || !password) {
            toast.warn("Vui lòng điền đầy đủ thông tin");
            return;
        }
        const res = await dispatch(loginUser({ email, password }));

        if(loginUser.fulfilled.match(res)){
            toast.success("Đăng nhập thành công. Chào mừng bạn quay trở lại!");
            navigate("/");
        } 
        else if (loginUser.rejected.match(res)) {
            const errorMessage = res.payload || "Email hoặc mật khẩu không chính xác";
            toast.error(errorMessage);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Đăng nhập</CardTitle>
                <CardDescription>Đăng nhập vào tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="abc@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full hover:shadow-gray-400"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            "Đăng nhập"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default LoginForm;