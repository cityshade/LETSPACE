"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, ArrowDownRight, Landmark, Receipt,
  RefreshCw, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ReconciliationRecord {
  id: string;
  tenantName: string;
  propertyUnit: string;
  totalAmount: number;
  platformFee: number;
  landlordAmount: number;
  feeRate: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paystackRef: string | null;
  processedAt: string;
}

interface Summary {
  totalCollected: number;
  platformFees: number;
  netToLandlords: number;
  transactions: number;
}

interface ApiResponse {
  data: ReconciliationRecord[];
  total: number;
  summary: {
    allTime: Summary;
    thisMonth: Summary;
  };
}

const DEMO_ORG = "kamau-properties"; // replace with session org

const statusIcon = {
  COMPLETED: <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />,
  PENDING:   <Clock className="h-3.5 w-3.5 text-yellow-500" />,
  FAILED:    <XCircle className="h-3.5 w-3.5 text-red-500" />,
};

const statusClass = {
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  PENDING:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  FAILED:    "bg-red-50 text-red-700 border-red-200",
};

export default function ReconciliationPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showSpinner = false) {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch(`/api/reconciliation?organizationId=${DEMO_ORG}&limit=50`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    // Poll every 15 seconds for real-time updates
    const interval = setInterval(() => load(), 15_000);
    return () => clearInterval(interval);
  }, []);

  const month = data?.summary.thisMonth;
  const all = data?.summary.allTime;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reconciliation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time split payment records — Paystack auto-reconciliation
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => load(true)}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* This Month Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Collected (Month)</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : formatCurrency(month?.totalCollected ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{month?.transactions ?? 0} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Net to Landlords</span>
              <Landmark className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-700">
              {loading ? "—" : formatCurrency(month?.netToLandlords ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">After platform fee</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Platform Fees</span>
              <Receipt className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {loading ? "—" : formatCurrency(month?.platformFees ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">LETSPACE earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">All-Time Net</span>
              <ArrowDownRight className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : formatCurrency(all?.netToLandlords ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{all?.transactions ?? 0} total transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Transaction Ledger</CardTitle>
              <CardDescription>Every payment auto-reconciled in real time</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Live · updates every 15s
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              Loading reconciliation records...
            </div>
          ) : !data?.data.length ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
              <Receipt className="h-8 w-8 opacity-30" />
              <p className="text-sm">No transactions yet. Payments will appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/60">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date & Time</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tenant</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Property / Unit</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total Paid</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">
                      Fee ({data.data[0]?.feeRate ?? 2.5}%)
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Net to You</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.data.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(new Date(rec.processedAt))}
                      </td>
                      <td className="py-3 px-4 font-medium">{rec.tenantName}</td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">
                        {rec.propertyUnit}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(rec.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 text-xs hidden sm:table-cell">
                        −{formatCurrency(rec.platformFee)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-700">
                        {formatCurrency(rec.landlordAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium ${statusClass[rec.status]}`}
                          >
                            {statusIcon[rec.status]}
                            {rec.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Info */}
      <Card className="border-blue-100 bg-blue-50/40">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <Receipt className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900">How split payments work</p>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                When a tenant pays, Paystack automatically splits the transaction. Your platform fee (2.5%, min KES 50, max KES 500)
                is deducted from the landlord&apos;s share and credited to LETSPACE. The landlord receives the net amount
                directly to their registered bank account. Every transaction is reconciled in real time — no manual work needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
