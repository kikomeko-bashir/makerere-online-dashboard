import { useState, useEffect } from "react";
import { Loader2, Wallet, TrendingUp, ArrowDownCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";

interface PaymentRecord {
  id: string;
  student_id: string;
  enrollment_id: string | null;
  amount: number;
  currency: string;
  phone_number: string;
  carrier: string;
  payment_type: string;
  status: string;
  request_reference: string | null;
  response_message: string | null;
  description: string;
  created_at: string;
  completed_at: string | null;
}

interface SystemWalletData {
  balance: number;
  currency: string;
  total_received: number;
  total_withdrawn: number;
}

function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString()}`;
}

export default function DashboardPayments() {
  const { user } = useAuth();

  if (user.role === "super_admin") return <SuperAdminPayments />;
  if (user.role === "admin") return <AdminPayments />;
  if (user.role === "lecturer") return <LecturerPayments />;
  return <StudentPayments />;
}

// ─── Super Admin — System Wallet + All Payments ──────────────────────────────

function SuperAdminPayments() {
  const [wallet, setWallet] = useState<SystemWalletData | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [walletData, paymentsData] = await Promise.all([
        api.getSystemWallet(),
        api.getPayments(),
      ]);
      setWallet(walletData);
      setPayments(paymentsData as PaymentRecord[]);
    } catch {
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="System Wallet & Payments" description="Overview of all payments and the system wallet." />

      {/* Wallet Cards */}
      {wallet && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="h-5 w-5" />
              <span className="text-xs font-medium">Wallet Balance</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatUGX(wallet.balance)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs font-medium">Total Received</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatUGX(wallet.total_received)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-orange-600">
              <ArrowDownCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Total Withdrawn</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatUGX(wallet.total_withdrawn)}</p>
          </div>
        </div>
      )}

      <PaymentsTable payments={payments} />
    </div>
  );
}

// ─── Admin — All Payments ────────────────────────────────────────────────────

function AdminPayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPayments()
      .then((data) => setPayments(data as PaymentRecord[]))
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="All Payments" description="View all payment transactions in the system." />
      <PaymentsTable payments={payments} />
    </div>
  );
}

// ─── Lecturer — Their Wallet + Payments received ─────────────────────────────

function LecturerPayments() {
  const [wallet, setWallet] = useState<{ balance: number; currency: string; total_earned: number } | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getLecturerWallet(), api.getPayments()])
      .then(([w, p]) => { setWallet(w); setPayments(p as PaymentRecord[]); })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="My Wallet" description="Track payments received from tutoring sessions." />

      {wallet && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="h-5 w-5" />
              <span className="text-xs font-medium">Wallet Balance</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatUGX(wallet.balance)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs font-medium">Total Earned</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatUGX(wallet.total_earned)}</p>
          </div>
        </div>
      )}

      <PaymentsTable payments={payments} />
    </div>
  );
}

// ─── Student — Their payment history ─────────────────────────────────────────

function StudentPayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPayments()
      .then((data) => setPayments(data as PaymentRecord[]))
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="My Payments" description="Your payment history for courses and tutoring." />
      <PaymentsTable payments={payments} />
    </div>
  );
}

// ─── Shared Payments Table ───────────────────────────────────────────────────

function PaymentsTable({ payments }: { payments: PaymentRecord[] }) {
  const columns: ColumnDef<Record<string, unknown>>[] = [
    {
      key: "description",
      header: "Description",
      render: (row) => (
        <div>
          <p className="text-sm font-medium">{(row as unknown as PaymentRecord).description}</p>
          <p className="text-xs text-muted-foreground capitalize">{(row as unknown as PaymentRecord).payment_type.replace("_", " ")}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => <span className="font-medium">{formatUGX((row as unknown as PaymentRecord).amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const s = (row as unknown as PaymentRecord).status;
        return (
          <Badge variant={s === "completed" ? "default" : s === "pending" ? "secondary" : "destructive"}>
            {s}
          </Badge>
        );
      },
    },
    {
      key: "carrier",
      header: "Carrier",
      render: (row) => <span className="text-sm uppercase">{(row as unknown as PaymentRecord).carrier}</span>,
    },
    {
      key: "created_at",
      header: "Date",
      render: (row) => {
        try {
          return <span className="text-sm">{format(new Date((row as unknown as PaymentRecord).created_at), "MMM d, yyyy")}</span>;
        } catch { return <span className="text-sm">—</span>; }
      },
    },
    {
      key: "request_reference",
      header: "Reference",
      render: (row) => <span className="text-xs font-mono">{(row as unknown as PaymentRecord).request_reference || "—"}</span>,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <DataTable<Record<string, unknown>>
        columns={columns}
        data={payments as unknown as Record<string, unknown>[]}
        searchableFields={["description"]}
        searchPlaceholder="Search payments..."
        emptyMessage="No payments found."
      />
    </div>
  );
}
