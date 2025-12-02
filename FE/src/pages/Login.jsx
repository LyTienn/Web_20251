import LoginForm from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';

const Login = () => {
    return (
        <div className='min-h-screen flex items-center justify-center bg-muted/30 p-4'>
            <div className="w-full max-w-md space-y-4">
                <LoginForm />
                <div className='text-center'>
                    Chưa có tài khoản?{" "}
                    <Link to='/register' className="font-medium hover:underline">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login;