import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, CreditCard, Users, Wrench, BarChart3, Sparkles,
  Home, CheckCircle2, ArrowRight, Star, Shield, Zap, Globe,
  Smartphone, TrendingUp, MessageSquare, Lock,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LETSPACE - Kenya's #1 Property Management SaaS",
  description: "The complete property management platform for Kenyan landlords and agents. M-Pesa rent collection, AI-powered insights, tenant screening, and more.",
  keywords: "property management Kenya, real estate software Kenya, M-Pesa rent collection, landlord software Nairobi",
};

const features = [
  {
    icon: Smartphone,
    title: "M-Pesa Rent Collection",
    desc: "Automated STK push rent collection via Safaricom M-Pesa. Instant receipts, real-time payment tracking, and automated reminders.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Sparkles,
    title: "Claude AI Assistant",
    desc: "Powered by Anthropic's Claude. Generate property descriptions, screen tenants, analyze market rents, and get intelligent insights.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Building2,
    title: "Property Portfolio Management",
    desc: "Manage unlimited properties and units. Track occupancy, maintenance, leases, and financials in one place.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Users,
    title: "Smart Tenant Management",
    desc: "Digital applications, AI-powered screening, lease management, and tenant communication tools built for Kenya.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: BarChart3,
    title: "Financial Analytics",
    desc: "Real-time revenue tracking, expense management, VAT compliance, KRA-ready reports, and ROI analysis.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Wrench,
    title: "Maintenance Management",
    desc: "Digitize work orders, assign vendors, track completion, and let Claude AI prioritize urgent repairs automatically.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Globe,
    title: "Public Property Portal",
    desc: "Beautiful listing pages with SEO optimization. Let tenants find your properties on Google and apply online.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Shield,
    title: "Compliance & Security",
    desc: "Kenya Landlord & Tenant Act compliance, EARB standards, ISO-grade data security, role-based access control.",
    color: "bg-yellow-50 text-yellow-600",
  },
];

const stats = [
  { value: "50,000+", label: "Properties Managed" },
  { value: "KES 2B+", label: "Rent Collected Monthly" },
  { value: "98%", label: "M-Pesa Success Rate" },
  { value: "47", label: "Kenya Counties Covered" },
];

const plans = [
  {
    name: "FREE",
    price: { monthly: 0 },
    desc: "Perfect for landlords getting started",
    features: [
      "1 property, up to 5 units",
      "Basic tenant management",
      "M-Pesa rent collection",
      "10 AI queries/month",
      "Email support",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "STARTER",
    price: { monthly: 3000 },
    desc: "For growing landlords",
    features: [
      "5 properties, up to 50 units",
      "Full tenant management",
      "Automated rent reminders",
      "100 AI queries/month",
      "Financial reports",
      "3 team members",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "PROFESSIONAL",
    price: { monthly: 10000 },
    desc: "For property managers & agencies",
    features: [
      "25 properties, up to 500 units",
      "Advanced AI screening",
      "Custom branded portal",
      "1,000 AI queries/month",
      "Advanced analytics",
      "10 team members",
      "API access",
      "Dedicated support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "ENTERPRISE",
    price: { monthly: 30000 },
    desc: "For large property companies",
    features: [
      "Unlimited properties & units",
      "Custom AI training",
      "White-label solution",
      "Unlimited AI queries",
      "Custom integrations",
      "Unlimited team members",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const testimonials = [
  {
    name: "John Kamau",
    title: "Landlord, 12 Properties · Nairobi",
    quote: "LETSPACE transformed how I manage my properties. M-Pesa collection is seamless and the AI gives me insights I never had before. Rent collection rate went from 72% to 94%.",
    rating: 5,
  },
  {
    name: "Fatima Mohammed",
    title: "Property Manager · Mombasa",
    quote: "The tenant screening AI is incredible. It analyzes applications in seconds and gives me a risk score. Saved us from 3 problematic tenants in the first month alone.",
    rating: 5,
  },
  {
    name: "Kevin Onyango",
    title: "Real Estate Agency · Kisumu",
    quote: "We manage 200+ units across Western Kenya. LETSPACE scaled with us perfectly. The analytics dashboard alone is worth every shilling of the subscription.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">LET<span className="text-blue-600">SPACE</span></span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="/listings" className="hover:text-gray-900 transition-colors">Find Properties</Link>
            <Link href="#testimonials" className="hover:text-gray-900 transition-colors">Reviews</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="hidden sm:flex">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by Claude AI · Built for Kenya
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Kenya&apos;s Most Intelligent
              <span className="block text-blue-600">Property Management Platform</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Collect rent via M-Pesa, screen tenants with AI, manage maintenance,
              track finances, and grow your property portfolio — all in one platform
              designed specifically for the Kenyan market.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button size="xl" className="letspace-gradient text-white shadow-lg shadow-blue-200">
                  Start Free — No Credit Card
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/listings">
                <Button size="xl" variant="outline">
                  <Building2 className="h-5 w-5" />
                  Browse Properties
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Free forever for 1 property · No setup fees · Cancel anytime
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 rounded-2xl border shadow-2xl overflow-hidden bg-gray-50">
            <div className="bg-gray-800 h-8 flex items-center px-4 gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-gray-400 text-xs ml-4">app.letspace.co.ke/dashboard</span>
            </div>
            <div className="p-8 grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50">
              {[
                { label: "Monthly Revenue", value: "KES 4.28M", icon: "💰", change: "+12%" },
                { label: "Occupancy Rate", value: "89%", icon: "🏢", change: "+4%" },
                { label: "Active Tenants", value: "131", icon: "👥", change: "+8" },
                { label: "Overdue Rent", value: "KES 642K", icon: "⚠️", change: "8 invoices" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-lg font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-green-600 font-medium">{item.change}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-white">{stat.value}</p>
              <p className="text-blue-200 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Manage Properties in Kenya</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Built from the ground up for the Kenyan real estate market — from Nairobi to Mombasa, Kisumu to Eldoret.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-xl border bg-white p-6 hover:shadow-md transition-shadow">
                  <div className={`inline-flex rounded-xl p-3 ${feature.color} mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* M-Pesa Feature Callout */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
              <Smartphone className="h-3 w-3 mr-1" />
              M-Pesa Integration
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">
              Collect Rent via M-Pesa — Automatically
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Send STK push payment requests directly to your tenants&apos; phones.
              Automatic reconciliation, instant receipts, and real-time balance updates.
              Works with Paybill and Buy Goods numbers.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Automated STK Push rent collection",
                "Real-time M-Pesa payment webhooks",
                "Automatic receipt generation",
                "Bulk payment reminders via SMS",
                "Support for Paybill & Till numbers",
                "M-Pesa statement reconciliation",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">📱</div>
                <p className="font-semibold text-gray-900">M-Pesa Rent Payment</p>
                <p className="text-xs text-gray-500">STK Push Request</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tenant</span>
                  <span className="font-medium">Grace Wanjiku</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">0712-345-678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-green-700">KES 45,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice</span>
                  <span className="font-medium">INV-2026-0301</span>
                </div>
              </div>
              <Button variant="mpesa" className="w-full mt-4">
                Send M-Pesa Request
              </Button>
              <p className="text-[10px] text-center text-gray-400 mt-2">
                Tenant receives M-Pesa prompt on their phone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="mt-3 text-gray-600">Start free. Scale as you grow. Cancel anytime.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-sm text-gray-600">Monthly</span>
              <div className="h-6 w-11 rounded-full bg-blue-600 relative cursor-pointer">
                <div className="h-4 w-4 rounded-full bg-white absolute top-1 right-1" />
              </div>
              <span className="text-sm font-medium text-blue-600">Annual (Save 20%)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 p-6 relative ${
                  plan.highlighted
                    ? "border-blue-600 bg-blue-600 text-white shadow-xl scale-105"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-yellow-400 text-yellow-900 border-yellow-400 text-xs font-bold">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div className={`text-xs font-semibold mb-1 ${plan.highlighted ? "text-blue-200" : "text-muted-foreground"}`}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold">
                    {plan.price.monthly === 0 ? "Free" : `KES ${plan.price.monthly.toLocaleString()}`}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className={`text-sm ${plan.highlighted ? "text-blue-200" : "text-muted-foreground"}`}>/mo</span>
                  )}
                </div>
                <p className={`text-xs mb-6 ${plan.highlighted ? "text-blue-100" : "text-muted-foreground"}`}>
                  {plan.desc}
                </p>

                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-xs ${plan.highlighted ? "text-blue-100" : "text-gray-600"}`}>
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlighted ? "text-blue-300" : "text-green-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={plan.name === "ENTERPRISE" ? "/contact" : "/register"}>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "outline" : "default"}
                    style={plan.highlighted ? { backgroundColor: "white", color: "#2563eb" } : {}}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            All plans include M-Pesa integration, SSL security, and automatic backups.
            <Link href="/pricing" className="text-blue-600 hover:underline ml-1">Compare all features →</Link>
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Trusted by Kenya&apos;s Top Landlords</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 letspace-gradient">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Property Management?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join 50,000+ Kenya landlords who trust LETSPACE. Start free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="xl" className="bg-white text-blue-700 hover:bg-blue-50">
                Start Free Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/listings">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">LET<span className="text-blue-400">SPACE</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Kenya&apos;s most intelligent property management platform. Built for landlords, agents, and property managers across all 47 counties.
            </p>
            <div className="flex gap-3 mt-4">
              {["🇰🇪 Made in Kenya", "ISO 27001 Ready", "M-Pesa Certified"].map((badge) => (
                <span key={badge} className="text-[10px] bg-gray-800 px-2 py-1 rounded-full">{badge}</span>
              ))}
            </div>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Security", "API Docs", "Changelog"] },
            { title: "For Landlords", links: ["Find Tenants", "Rent Collection", "Maintenance", "Analytics", "Compliance"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Contact", "Privacy Policy"] },
          ].map((section) => (
            <div key={section.title}>
              <p className="text-white font-semibold text-sm mb-3">{section.title}</p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm hover:text-white transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2026 LETSPACE Technologies Ltd. All rights reserved.</p>
          <p className="text-xs">Regulated by Estate Agents Registration Board (EARB) · KRA Compliant</p>
        </div>
      </footer>
    </div>
  );
}
