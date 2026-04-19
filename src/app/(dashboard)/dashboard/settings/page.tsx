"use client";

import { useState } from "react";
import { Building2, CreditCard, Bell, Shield, Users, Webhook, Key, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const settingsSections = [
  { id: "organization", label: "Organization", icon: Building2, desc: "Company details and branding" },
  { id: "billing", label: "Billing & Plan", icon: CreditCard, desc: "Subscription and payments" },
  { id: "team", label: "Team Members", icon: Users, desc: "Manage roles and access" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "SMS, email, and alerts" },
  { id: "integrations", label: "Integrations", icon: Webhook, desc: "M-Pesa, Paystack, and APIs" },
  { id: "security", label: "Security", icon: Shield, desc: "Authentication and audit logs" },
  { id: "api", label: "API Keys", icon: Key, desc: "Developer access" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("organization");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your organization settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeSection === section.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${activeSection === section.id ? "text-blue-600" : "text-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{section.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{section.desc}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-gray-300 shrink-0" />
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {activeSection === "organization" && (
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Update your company information and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Organization Name</label>
                    <Input defaultValue="Kamau Properties Ltd" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                    <Input type="email" defaultValue="info@kamauproperties.co.ke" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
                    <Input defaultValue="+254 720 000 000" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Website</label>
                    <Input defaultValue="https://kamauproperties.co.ke" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">KRA PIN</label>
                    <Input defaultValue="A001234567B" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">EARB License</label>
                    <Input defaultValue="EARB/2024/001234" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Physical Address</label>
                  <Input defaultValue="Upperhill, Nairobi, Kenya" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "billing" && (
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your plan and payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-white/20 text-white border-0 mb-2">PROFESSIONAL Plan</Badge>
                      <p className="text-2xl font-bold">KES 10,000/month</p>
                      <p className="text-blue-100 text-sm mt-1">Next billing: April 1, 2026</p>
                    </div>
                    <Button variant="outline" className="border-white text-white hover:bg-white/10">
                      Upgrade Plan
                    </Button>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                    {[
                      { label: "Properties", used: 12, limit: 25 },
                      { label: "Units", used: 148, limit: 500 },
                      { label: "Team", used: 5, limit: 10 },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-xs text-blue-200">{item.label}</p>
                        <p className="font-semibold">{item.used} / {item.limit}</p>
                        <div className="h-1 rounded-full bg-white/20 mt-1.5 overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${(item.used / item.limit) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-3">Payment Methods</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">💳</div>
                        <div>
                          <p className="text-sm font-medium">Visa ending in 4242</p>
                          <p className="text-xs text-muted-foreground">Expires 12/2027</p>
                        </div>
                      </div>
                      <Badge variant="success" className="text-[10px]">Default</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3">Add Payment Method</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "integrations" && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect LETSPACE with payment providers and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: "M-Pesa (Safaricom Daraja)",
                    desc: "Collect rent and payments via M-Pesa STK Push",
                    status: "connected",
                    logo: "📱",
                  },
                  {
                    name: "Paystack",
                    desc: "Card payments for non-M-Pesa tenants",
                    status: "connected",
                    logo: "💳",
                  },
                  {
                    name: "Africa's Talking",
                    desc: "Bulk SMS notifications and reminders",
                    status: "connected",
                    logo: "📨",
                  },
                  {
                    name: "Resend",
                    desc: "Transactional email for invoices and receipts",
                    status: "connected",
                    logo: "✉️",
                  },
                  {
                    name: "Cloudinary",
                    desc: "Property images and document storage",
                    status: "connected",
                    logo: "☁️",
                  },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.logo}</div>
                      <div>
                        <p className="text-sm font-semibold">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={integration.status === "connected" ? "success" : "secondary"} className="text-[10px]">
                        {integration.status}
                      </Badge>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        {integration.status === "connected" ? "Configure" : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === "team" && (
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>5 of 10 members used</CardDescription>
                </div>
                <Button size="sm"><Users className="h-4 w-4" />Invite Member</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "John Kamau", email: "john@kamauprops.co.ke", role: "OWNER", status: "active" },
                    { name: "Mary Wangari", email: "mary@kamauprops.co.ke", role: "MANAGER", status: "active" },
                    { name: "David Mwenda", email: "david@kamauprops.co.ke", role: "AGENT", status: "active" },
                    { name: "Patricia Akinyi", email: "pat@kamauprops.co.ke", role: "ACCOUNTANT", status: "active" },
                    { name: "James Ochieng", email: "james@kamauprops.co.ke", role: "AGENT", status: "invited" },
                  ].map((member) => (
                    <div key={member.email} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.status === "active" ? "success" : "warning"} className="text-[10px]">
                          {member.role}
                        </Badge>
                        {member.role !== "OWNER" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500">Remove</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
