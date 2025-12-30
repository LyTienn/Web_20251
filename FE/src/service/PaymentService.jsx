import axiosInstance from "../config/Axios-config.jsx";

const PaymentService = {
  // Lấy lịch sử giao dịch
  async getPaymentHistory() {
    const res = await axiosInstance.get("/payment/history");
    return res;
  },
  // async getPaymentById(id) {
  //   const res = await axiosInstance.get(`/payment/${id}`);
  //   return res.data;
  // },
};

export default PaymentService;
