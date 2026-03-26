import { Plus, Search, Filter, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const mockInvoices = [
  { id: "INV-2026-0301", tenant: "Grace Wanjiku", unit: "A12 - Park View", type: "RENT", amount: 45000, status: "PAID", dueDate: new Date("2026-03-01"), paidDate: new Date("2026-03-03") },
  { id: "INV-2026-0302", tenant: "David Ochieng", unit: "B04 - Westlands", type: "RENT", amount: 85000, status: "PAID", dueDate: new Date("2026-03-01"), paidDate: new Date("2026-03-02") },
  { id: "INV-2026-0303", tenant: "James Mwangi", unit: "F07 - Kasarani", type: "RENT", amount: 28000, status: "OVERDUE", dueDate: new Date("2026-03-01"), paidDate: null },
  { id: "INV-2026-0304", tenant: "Amina Hassan", unit: "C08 - Garden Estate", type: "RENT", amount: 32000, status: "PARTIAL", dueDate: new Date("2026-03-05"), paidDate: null },
  { id: "INV-2026-0305", tenant: "Sarah Kamau", unit: "E02 - Lavington", type: "RENT", amount: 65000, status: "PENDING", dueDate: new Date("2026-04-01"), paidDate: null },
  { id: "INV-2026-0306", tenant: "Peter Njoroge", unit: "D15 - Kilimani", type: "SERVICE_CHARGE", amount: 8000, status: "PENDING", dueDate: new Date("2026-04-01"), paidDate: null },
  { id: "INV-2026-0307", tenant: "Lucy Achieng", unit: "G12 - South C", type: "RENT", amount: 18000, status: "OVERDUE", dueDate: new Date("2026-03-08"), paidDate: null },
  { id: "INV-2026-0308", tenant: "Grace Wanjiku", unit: "A12 - Park View", type: "DEPOSIT", amount: 90000, status: "PAID", dueDate: new Date("2026-01-01"), paidDate: new Date("2026-01-01") },
];

const statusVariants: Record<string, string> = {
  PAID: "success",
  PARTIAL: "warning",
  PENDING: "info",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
};

const typeColors: Record<string, string> = {
  RENT: "info",
  DEPOSIT: "purple",
  SERVICE_CHARGE: "warning",
  MAINTENANCE: "secondary",
  PENALTY: "destructive",
};

export default function InvoicesPage() {
  const total = mockInvoices.reduce((s, i) => s + i.amount, 0);
  const paid = mockInvoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const overdue = mockInvoices.filter(i => i.status === "OVERDUE").reduce((s, i) => s + i.amount, 0);
  const pending = mockInvoices.filter(i => ["PENDING", "PARTIAL"].includes(i.status)).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-muted-foreground">{mockInvoices.length} invoices this period</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button>
          <Button variant="outline" size="sm"><Send className="h-4 w-4" />Send Reminders</Button>
          <Link href="/dashboard/financials/invoices/new">
            <Button size="sm"><Plus className="h-4 w-4" />New Invoice</Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Invoiced</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(total)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Collected</p>
            <p className="text-xl font-bold mt-1 text-green-700">{formatCurrency(paid)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Overdue</p>
            <p className="text-xl font-bold mt-1 text-red-700">{formatCurrency(overdue)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-xl font-bold mt-1 text-yellow-700">{formatCurrency(pending)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search invoices..." prefix={<Search className="h-3.5 w-3.5" />} className="max-w-xs" />
        <div className="flex gap-1">
          {["All", "PAID", "PENDING", "OVERDUE", "PARTIAL"].map((s) => (
            <Button key={s} variant={s === "All" ? "default" : "outline"} size="sm" className="text-xs">{s}</Button>
          ))}
        </div>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Invoice Register</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Invoice #", "Tenant", "Unit", "Type", "Amount", "Due Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/financials/invoices/${inv.id}`} className="text-sm font-mono text-blue-600 hover:underline">
                        {inv.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{inv.tenant}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{inv.unit}</td>
                    <td className="px-4 py-3">
                      <Badge variant={typeColors[inv.type] as any} className="text-[10px]">
                        {inv.type.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold tabular-nums">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariants[inv.status] as any} className="text-[10px]">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {inv.status !== "PAID" && (
                          <Button size="sm" variant="mpesa" className="h-7 text-xs gap-1">
                            M-Pesa
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
