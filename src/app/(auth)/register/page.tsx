"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const benefits = [
  "Free forever for 1 property",
  "M-Pesa rent collection included",
  "AI-powered property tools",
  "No credit card required",
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"account" | "organization">("account");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("organization");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">LET<span className="text-blue-600">SPACE</span></span>
          </Link>
          <p className="text-sm text-gray-600 mt-2">Start managing properties smarter today</p>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 text-xs text-gray-700 border shadow-sm">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {b}
            </div>
          ))}
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex gap-2 mb-4">
              {["account", "organization"].map((s, i) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${step === s || (step === "organization" && i === 0) ? "bg-blue-600" : "bg-gray-200"}`} />
              ))}
            </div>
            <CardTitle className="text-xl">
              {step === "account" ? "Create your account" : "Set up your organization"}
            </CardTitle>
            <CardDescription>
              {step === "account" ? "Your personal login details" : "Your company or property management details"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "account" ? (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">First Name</label>
                    <Input placeholder="John" required className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Last Name</label>
                    <Input placeholder="Kamau" required className="h-11" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                  <Input type="email" placeholder="john@company.co.ke" required className="h-11" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="w-20">
                      <Input value="+254" readOnly className="h-11 bg-gray-50" />
                    </div>
                    <Input type="tel" placeholder="7XX XXX XXX" required className="h-11 flex-1" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      minLength={8}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11">
                  Continue →
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Organization / Company Name</label>
                  <Input placeholder="Kamau Properties Ltd" required className="h-11" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Business Type</label>
                  <select className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm">
                    <option>Individual Landlord</option>
                    <option>Property Management Company</option>
                    <option>Real Estate Agency</option>
                    <option>Developer / SACCO</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">City</label>
                    <Input placeholder="Nairobi" required className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">County</label>
                    <select className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm">
                      <option>Nairobi</option>
                      <option>Mombasa</option>
                      <option>Kisumu</option>
                      <option>Nakuru</option>
                      <option>Kiambu</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">How many properties do you manage?</label>
                  <select className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm">
                    <option>1 property (Just starting)</option>
                    <option>2-5 properties</option>
                    <option>6-25 properties</option>
                    <option>25+ properties</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setStep("account")}>
                    ← Back
                  </Button>
                  <Button type="submit" className="flex-1 h-11" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </div>
              </form>
            )}

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          By registering, you agree to our{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
