import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionStats({ history }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalTransactions = history.length;
  const successfulTransactions = history.filter(
    (t) => t.status === "ACTIVE"
  ).length;
  const totalSpent = history
    .filter((t) => t.status === "ACTIVE")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">Tổng quan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {totalTransactions}
            </p>
            <p className="text-sm text-muted-foreground">Tổng giao dịch</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {successfulTransactions}
            </p>
            <p className="text-sm text-muted-foreground">Thành công</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
