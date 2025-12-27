import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Package,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function TransactionCard({ transaction }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatPackageName = (pkg) => {
    const map = {
      "3_THANG": "Gói 3 tháng",
      "6_THANG": "Gói 6 tháng",
      "12_THANG": "Gói 12 tháng",
    };
    return map[pkg] || pkg;
  };

  const getStatusConfig = (status) => {
    const configs = {
      ACTIVE: {
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800 border-green-200",
        iconColor: "text-green-600",
      },
      PENDING: {
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        iconColor: "text-yellow-600",
      },
      CANCELLED: {
        icon: XCircle,
        color: "bg-red-100 text-red-800 border-red-200",
        iconColor: "text-red-600",
      },
      EXPIRED: {
        icon: AlertCircle,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        iconColor: "text-gray-600",
      },
    };
    return configs[status] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {formatPackageName(transaction.package)}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Mã GD:{" "}
              <span className="font-mono">{transaction.transactionId}</span>
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className={`${statusConfig.color} gap-1.5 px-3 py-1.5 font-medium`}
          >
            <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
            {transaction.statusText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {/* Số tiền */}
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Số tiền thanh toán</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(transaction.amount)}
            </span>
          </div>

          {/* Ngày bắt đầu */}
          {transaction.startDate && (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Ngày bắt đầu
              </span>
              <span className="font-medium">
                {formatDate(transaction.startDate)}
              </span>
            </div>
          )}

          {/* Ngày hết hạn */}
          {transaction.expiryDate && (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Ngày hết hạn
              </span>
              <span className="font-medium">
                {formatDate(transaction.expiryDate)}
              </span>
            </div>
          )}
        </div>

        {/* Ghi chú */}
        {transaction.status === "PENDING" && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            Giao dịch đang chờ xử lý. Vui lòng hoàn tất thanh toán.
          </div>
        )}

        {transaction.status === "CANCELLED" && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            <XCircle className="h-4 w-4 inline mr-2" />
            Giao dịch đã bị hủy hoặc thanh toán không thành công.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
