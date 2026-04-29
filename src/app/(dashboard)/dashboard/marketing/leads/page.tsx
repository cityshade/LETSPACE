import { Plus, Search, Phone, Mail, TrendingUp, Filter, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate, formatCurrency } from "@/lib/utils";

const mockLeads = [
  { id: "1", name: "Caroline Mutua", phone: "0723456789", email: "cmutua@email.com", source: "WEBSITE", status: "NEW", property: "Park View Apts", budget: 50000, message: "Looking for 2-bed apartment near Westlands CBD", aiScore: 88, createdAt: new Date("2026-03-25") },
  { id: "2", name: "Brian Otieno", phone: "0734567890", email: null, source: "REFERRAL", status: "CONTACTED", property: "Kilimani Heights", budget: 90000, message: "Family of 4 needs spacious 3-bed", aiScore: 72, createdAt: new Date("2026-03-24") },
  { id: "3", name: "Fatuma Abdalla", phone: "0745678901", email: "f.abdalla@gmail.com", source: "PORTAL", status: "VIEWING_SCHEDULED", property: "Lavington Court", budget: 150000, message: "Executive apartment with parking", aiScore: 95, createdAt: new Date("2026-03-23") },
  { id: "4", name: "Moses Kiprono", phone: "0756789012", email: null, source: "SOCIAL_MEDIA", status: "QUALIFIED", property: "Garden Estate", budget: 25000, message: "Bedsitter or 1-bed near Thika road", aiScore: 61, createdAt: new Date("2026-03-22") },
  { id: "5", name: "Winnie Auma", phone: "0767890123", email: "winnie.a@email.com", source: "PHONE", status: "OFFER_MADE", property: "Westlands Towers", budget: 80000, message: "2-bed, must have gym and pool", aiScore: 84, createdAt: new Date("2026-03-21") },
  { id: "6", name: "Robert Kamau", phone: "0778901234", email: "rkamau@corp.co.ke", source: "EMAIL", status: "WON", property: "Mombasa Office", budget: 120000, message: "Office space for tech startup, 10 people", aiScore: 91, createdAt: new Date("2026-03-19") },
];

const statusConfig: Record<string, { variant: string; label: string }> = {
  NEW: { variant: "info", label: "New" },
  CONTACTED: { variant: "info", label: "Contacted" },
  QUALIFIED: { variant: "warning", label: "Qualified" },
  VIEWING_SCHEDULED: { variant: "warning", label: "Viewing" },
  OFFER_MADE: { variant: "purple", label: "Offer Made" },
  WON: { variant: "success", label: "Won" },
  LOST: { variant: "secondary", label: "Lost" },
};

const sourceColors: Record<string, string> = {
  WEBSITE: "bg-blue-100 text-blue-700",
  REFERRAL: "bg-green-100 text-green-700",
  PORTAL: "bg-purple-100 text-purple-700",
  SOCIAL_MEDIA: "bg-pink-100 text-pink-700",
  PHONE: "bg-orange-100 text-orange-700",
  EMAIL: "bg-teal-100 text-teal-700",
};

export default function LeadsPage() {
  const won = mockLeads.filter(l => l.status === "WON").length;
  const active = mockLeads.filter(l => !["WON", "LOST"].includes(l.status)).length;
  const conversionRate = Math.round((won / mockLeads.length) * 100);
  const avgScore = Math.round(mockLeads.reduce((s, l) => s + l.aiScore, 0) / mockLeads.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads & Inquiries</h1>
          <p className="text-sm text-muted-foreground">{mockLeads.length} leads this month</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Import Leads</Button>
          <Button size="sm"><Plus className="h-4 w-4" />Add Lead</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: mockLeads.length, color: "text-blue-700" },
          { label: "Active Pipeline", value: active, color: "text-yellow-700" },
          { label: "Won / Converted", value: won, color: "text-green-700" },
          { label: "Avg AI Score", value: `${avgScore}/100`, color: "text-purple-700" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search leads..." prefix={<Search className="h-3.5 w-3.5" />} className="max-w-xs" />
        <Button variant="outline" size="sm"><Filter className="h-4 w-4" />Filter</Button>
        {["All", "New", "Qualified", "Viewing", "Won"].map((f) => (
          <Button key={f} variant={f === "All" ? "default" : "outline"} size="sm" className="text-xs">{f}</Button>
        ))}
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {mockLeads.map((lead) => {
          const statusCfg = statusConfig[lead.status];
          return (
            <Card key={lead.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {lead.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </div>

                  {/* Main */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{lead.name}</span>
                          <Badge variant={statusCfg.variant as any} className="text-[10px]">{statusCfg.label}</Badge>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sourceColors[lead.source] || "bg-gray-100 text-gray-700"}`}>
                            {lead.source.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{lead.message}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-semibold">{lead.aiScore}</span>
                          <span className="text-[10px] text-muted-foreground">AI Score</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatRelativeDate(lead.createdAt)}</p>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-medium text-gray-700">{lead.property}</span>
                      <span>Budget: <span className="font-medium text-gray-700">{formatCurrency(lead.budget)}/mo</span></span>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs">Schedule Viewing</Button>
                    {lead.status !== "WON" && (
                      <Button size="sm" variant="success" className="h-8 text-xs">Convert</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
