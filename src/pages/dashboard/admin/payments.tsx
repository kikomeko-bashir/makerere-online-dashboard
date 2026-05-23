import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DollarSign, Clock, AlertTriangle, TrendingUp, CreditCard } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { Payment, PaymentMethod } from "@/lib/types";
import { mockPayments } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString()}`;
}

function getStatusBadge(status: Payment["status"]) {
  switch (status) {
    case "completed":
      return <Badge variant="default">Completed</Badge>;
    case "pending":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Pending
        </Badge>
      );
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
  }
}

function getMethodBadge(method: Payment["method"]) {
  switch (method) {
    case "mobile_money":
      return <Badge variant="outline">Mobile Money</Badge>;
    case "bank_transfer":
      return <Badge variant="outline">Bank Transfer</Badge>;
    case "card":
      return <Badge variant="outline">Card</Badge>;
  }
}

// ─── Admin View ────────────────────────────────────────────────────────────────

function AdminPaymentsView() {
  const totalRevenue = useMemo(
    () =>
      mockPayments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
    [],
  );

  const pendingCount = useMemo(() => mockPayments.filter((p) => p.status === "pending").length, []);

  const failedCount = useMemo(() => mockPayments.filter((p) => p.status === "failed").length, []);

  // Generate monthly revenue data from payments
  const monthlyRevenue = useMemo(() => {
    const months: Record<string, number> = {};
    mockPayments
      .filter((p) => p.status === "completed")
      .forEach((p) => {
        const date = new Date(p.date);
        const key = format(date, "MMM yyyy");
        months[key] = (months[key] || 0) + p.amount;
      });

    return Object.entries(months)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, []);

  const columns: ColumnDef<Payment>[] = [
    { key: "transactionId", header: "Transaction ID" },
    { key: "description", header: "Description" },
    {
      key: "amount",
      header: "Amount",
      render: (row) => formatUGX(row.amount),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => format(new Date(row.date), "dd MMM yyyy"),
    },
    {
      key: "method",
      header: "Method",
      render: (row) => getMethodBadge(row.method),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Track and manage payments and transactions." />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          icon={DollarSign}
          value={formatUGX(totalRevenue)}
          label="Total Revenue"
          delta={`${mockPayments.filter((p) => p.status === "completed").length} transactions`}
        />
        <KpiCard icon={Clock} value={String(pendingCount)} label="Pending Payments" />
        <KpiCard icon={AlertTriangle} value={String(failedCount)} label="Failed Transactions" />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Revenue Over Time</h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis
                fontSize={12}
                tickFormatter={(value: number) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip formatter={(value: number) => [formatUGX(value), "Revenue"]} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Transaction History</h2>
        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={mockPayments as unknown as Record<string, unknown>[]}
          searchableFields={["transactionId", "description"]}
          searchPlaceholder="Search transactions..."
        />
      </div>
    </div>
  );
}

// ─── Student View ──────────────────────────────────────────────────────────────

interface PaymentFormData {
  amount: string;
  phoneNumber: string;
  method: PaymentMethod | "";
}

const emptyPaymentForm: PaymentFormData = {
  amount: "",
  phoneNumber: "",
  method: "",
};

function StudentPaymentsView() {
  const { user } = useAuth();

  const [payments, setPayments] = useState<Payment[]>([...mockPayments]);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>(emptyPaymentForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // Student's transactions
  const myPayments = payments.filter((p) => p.studentId === user.id);

  const pendingAmount = myPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaid = myPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const columns: ColumnDef<Payment>[] = [
    { key: "transactionId", header: "Transaction ID" },
    { key: "description", header: "Description" },
    {
      key: "amount",
      header: "Amount",
      render: (row) => formatUGX(row.amount),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => format(new Date(row.date), "dd MMM yyyy"),
    },
    {
      key: "method",
      header: "Method",
      render: (row) => getMethodBadge(row.method),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
  ];

  const openPaymentForm = () => {
    // Pre-fill with pending amount if any
    setFormData({
      amount: pendingAmount > 0 ? String(pendingAmount) : "",
      phoneNumber: "",
      method: "",
    });
    setErrors({});
    setFormOpen(true);
  };

  const handleSubmitPayment = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = "Amount is required";
    if (!formData.method) newErrors.method = "Payment method is required";
    if (formData.method === "mobile_money" && !formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required for Mobile Money";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      transactionId: `TXN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      studentId: user.id,
      description: "Payment",
      amount: Number(formData.amount),
      date: new Date().toISOString(),
      method: formData.method as PaymentMethod,
      phoneNumber: formData.method === "mobile_money" ? formData.phoneNumber : undefined,
      status: "completed",
    };

    setPayments((prev) => [...prev, newPayment]);
    toast.success("Payment successful!", {
      description: `${formatUGX(Number(formData.amount))} paid via ${formData.method === "mobile_money" ? "Mobile Money" : formData.method === "bank_transfer" ? "Bank Transfer" : "Card"}.`,
    });
    setFormOpen(false);
  };

  const handleRetryPayment = (payment: Payment) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === payment.id ? { ...p, status: "completed" as const, failureReason: undefined } : p,
      ),
    );
    toast.success("Payment retried successfully!");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="View your payment history and make payments.">
        <Button onClick={openPaymentForm}>
          <CreditCard className="mr-2 h-4 w-4" />
          Make Payment
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard icon={DollarSign} value={formatUGX(totalPaid)} label="Total Paid" />
        <KpiCard icon={Clock} value={formatUGX(pendingAmount)} label="Pending Amount" />
        <KpiCard icon={CreditCard} value={String(myPayments.length)} label="Total Transactions" />
      </div>

      {/* Transaction History */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Transaction History</h2>
        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={myPayments as unknown as Record<string, unknown>[]}
          searchableFields={["transactionId", "description"]}
          searchPlaceholder="Search transactions..."
          emptyMessage="No transactions found."
          rowActions={(row) => {
            const payment = row as unknown as Payment;
            if (payment.status === "failed") {
              return (
                <Button size="sm" variant="outline" onClick={() => handleRetryPayment(payment)}>
                  Retry
                </Button>
              );
            }
            return null;
          }}
        />
      </div>

      {/* Payment Form Dialog */}
      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Make Payment"
        description="Complete your payment using your preferred method."
        onSubmit={handleSubmitPayment}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pay-amount">Amount (UGX)</Label>
            <Input
              id="pay-amount"
              type="number"
              min={0}
              value={formData.amount}
              onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))}
              placeholder="Enter amount"
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={formData.method}
              onValueChange={(val) => setFormData((f) => ({ ...f, method: val as PaymentMethod }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
            {errors.method && <p className="text-xs text-destructive">{errors.method}</p>}
          </div>

          {formData.method === "mobile_money" && (
            <div className="space-y-2">
              <Label htmlFor="pay-phone">Phone Number</Label>
              <Input
                id="pay-phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData((f) => ({ ...f, phoneNumber: e.target.value }))}
                placeholder="e.g. 0772345678"
              />
              {errors.phoneNumber && (
                <p className="text-xs text-destructive">{errors.phoneNumber}</p>
              )}
            </div>
          )}
        </div>
      </EntityFormDialog>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DashboardPayments() {
  const { user } = useAuth();

  if (user.role === "student") {
    return <StudentPaymentsView />;
  }

  return <AdminPaymentsView />;
}
