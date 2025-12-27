import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star, Shield, ArrowLeft, Loader2, Copy } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import axios from "@/config/Axios-config";
import { setUser } from "@/redux/Auth/AuthSlice";

const Membership = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null); // Lưu thông tin đơn hàng

    const packages = [
        {
            id: "3_THANG",
            name: "Gói 3 tháng",
            price: 99000,
            period: "3 tháng",
            features: ["Truy cập không giới hạn", "Hỗ trợ 24/7"],
            isBestValue: false,
        },
        {
            id: "6_THANG",
            name: "Gói 6 tháng",
            price: 179000,
            period: "6 tháng",
            features: ["Truy cập không giới hạn", "Hỗ trợ 24/7", "Giảm giá 10%"],
            isBestValue: true,
        },
        {
            id: "12_THANG",
            name: "Gói 12 tháng",
            price: 299000,
            period: "12 tháng",
            features: ["Truy cập không giới hạn", "Hỗ trợ 24/7", "Giảm giá 15%"],
            isBestValue: false,
        },
    ];

    const handleUpgrade = async (pkg) => {
        if(!user) {
            toast.error("Vui lòng đăng nhập để nâng cấp gói thành viên.");
            return navigate("/login");
        }

        try {
            setLoading(true);
            const res = await axios.post("/payment/sepay/create", {
                package_details: pkg.id,
                amount: pkg.price,
            });

            if (res.success && res.data) {
                console.log("paymentInfo:", res.data);
                setPaymentInfo(res.data); // Lưu thông tin đơn hàng
                toast.info("Đơn hàng đã được tạo. Vui lòng chuyển khoản theo thông tin dưới đây.");
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            toast.error("Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Đã sao chép nội dung chuyển khoản!");
    };

    const handleFinish = () => {
        // Reload để cập nhật lại thông tin User (Tier: PREMIUM) từ Backend
        window.location.href = "/"; 
    };

    useEffect(() => {
        let interval;
        if (paymentInfo) {
            interval = setInterval( async () => {
                try {
                    const res = await axios.get('/profile');
                    if (res.success && res.data) {
                        const updatedUser = res.data || res.data.user;
                        console.log("Polling User Tier:", updatedUser.tier);
                        if (updatedUser.tier === 'PREMIUM') {
                            dispatch(setUser(updatedUser));
                            setPaymentInfo(null);
                            clearInterval(interval);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [paymentInfo, dispatch]);
    
    if (user?.tier === 'PREMIUM') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full border border-yellow-200">
           <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="h-10 w-10 text-yellow-500 fill-yellow-500" />
           </div>
           <h2 className="text-2xl font-bold text-slate-800 mb-2">Bạn đang là Hội viên Premium</h2>
           <p className="text-slate-600 mb-6">Cảm ơn bạn đã đồng hành. Hãy tận hưởng kho sách không giới hạn!</p>
           <Button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white hover:bg-slate-800">
             Về trang đọc sách
           </Button>
        </div>
      </div>
    );
  }

  if (paymentInfo) {
    const { bankAccount, bankName, amount, orderId } = paymentInfo;
    const qrUrl = `https://qr.sepay.vn/img?bank=${bankName}&acc=${bankAccount}&template=compact&amount=${amount}&des=${orderId}`;
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-200 relative">
          <Button onClick={() => setPaymentInfo(null)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 flex items-center text-sm">
             <ArrowLeft className="h-4 w-4 mr-1" /> Chọn gói khác
          </Button>

          <h2 className="text-2xl font-bold text-slate-800 mb-2 mt-4">Thanh toán chuyển khoản</h2>
          <p className="text-slate-500 mb-6 text-sm">Mở App Ngân hàng và quét mã QR bên dưới</p>

          {/* QR CODE */}
          <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-inner mb-6 inline-block">
             <img src={qrUrl} alt="Mã QR Thanh toán" className="w-64 h-64 object-contain" />
          </div>

          <div className="text-left bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm mb-6 space-y-3">
            <div className="flex justify-between border-b border-yellow-200 pb-2">
                <span className="text-slate-600">Ngân hàng:</span> 
                <span className="font-bold text-slate-800">{bankName}</span>
            </div>
            <div className="flex justify-between border-b border-yellow-200 pb-2">
                <span className="text-slate-600">Số tài khoản:</span> 
                <span className="font-bold text-slate-800 tracking-wider">{bankAccount}</span>
            </div>
            <div className="flex justify-between border-b border-yellow-200 pb-2">
                <span className="text-slate-600">Số tiền:</span> 
                <span className="font-bold text-red-600 text-lg">{amount.toLocaleString()}đ</span>
            </div>
             
             {/* NỘI DUNG CHUYỂN KHOẢN */}
            <div className="pt-1">
                <p className="text-xs text-slate-500 mb-1">Nội dung chuyển khoản (Bắt buộc):</p>
                <div className="flex gap-2">
                    <div className="flex-1 text-lg font-mono font-bold text-blue-700 bg-white p-2 rounded border border-dashed border-blue-300 text-center">
                        {orderId}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => handleCopy(orderId)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
                onClick={handleFinish} 
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-semibold shadow-lg shadow-green-200"
            >
                Đã chuyển tiền & Kích hoạt
            </Button>
            <p className="text-xs text-slate-400">
               Hệ thống tự động kích hoạt sau 1-3 phút khi nhận tiền.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Nâng cấp gói Hội viên</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Mở khóa không giới hạn kho tri thức. Đầu tư cho bản thân với chi phí chỉ bằng một ly cà phê.
        </p>
      </div>

      {/* Grid Packages */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center px-2 md:px-12">
        
        {packages.map((pkg) => (
            <div 
                key={pkg.id}
                className={`bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 relative border
                    ${pkg.isBestValue ? 'border-2 border-yellow-400 transform md:scale-105 z-10' : 'border-slate-200 hover:border-blue-300'}
                `}
            >
                {pkg.isBestValue && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                        PHỔ BIẾN NHẤT
                    </div>
                )}

                <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    {pkg.isBestValue && <Star className="fill-yellow-400 text-yellow-400 h-5 w-5" />} 
                    {pkg.name}
                </h3>
                
                <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-800">{pkg.price.toLocaleString()}đ</span>
                    <span className="text-slate-400 text-sm font-normal"> / {pkg.period}</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                    {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex gap-3 text-slate-700">
                            <Check className={`h-5 w-5 ${pkg.isBestValue ? 'text-yellow-500' : 'text-blue-500'}`} /> 
                            {feature}
                        </li>
                    ))}
                </ul>

                <Button 
                    onClick={() => handleUpgrade(pkg)} 
                    disabled={loading}
                    className={`w-full h-12 text-lg font-bold transition-all
                        ${pkg.isBestValue 
                            ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-yellow-200 shadow-md' 
                            : 'bg-slate-900 hover:bg-slate-800 text-white'}
                    `} 
                >
                    {loading ? <Loader2 className="animate-spin mr-2"/> : "Nâng cấp ngay"}
                </Button>
            </div>
        ))}

      </div>
      
      <div className="text-center mt-12 text-slate-400 text-sm">
        <p className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" /> Thanh toán an toàn & bảo mật
        </p>
      </div>
    </div>
  );
}

export default Membership;