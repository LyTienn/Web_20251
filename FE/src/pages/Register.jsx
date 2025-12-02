import RegisterForm from "../components/auth/RegisterForm";
import { Link } from "react-router-dom";

const Register = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md space-y-4">
                <RegisterForm />
                <p className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link to="/login" className="hover:underline font-medium">
                    Đăng nhập
                </Link>
                </p>
            </div>
        </div>
    )
}

export default Register;