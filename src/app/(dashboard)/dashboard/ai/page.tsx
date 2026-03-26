"use client";

import { useState } from "react";
import { Sparkles, Send, Bot, User, TrendingUp, FileText, Search, Wrench, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const aiCapabilities = [
  { icon: TrendingUp, label: "Pricing Intelligence", desc: "Get market rent analysis for any Nairobi location", color: "bg-blue-50 text-blue-600" },
  { icon: FileText, label: "Lease Analysis", desc: "Review and summarize lease agreements instantly", color: "bg-purple-50 text-purple-600" },
  { icon: Building2, label: "Property Descriptions", desc: "Generate compelling marketing copy in seconds", color: "bg-green-50 text-green-600" },
  { icon: User, label: "Tenant Screening", desc: "AI-powered risk assessment for applications", color: "bg-orange-50 text-orange-600" },
  { icon: Wrench, label: "Maintenance Priority", desc: "Assess and triage maintenance requests", color: "bg-red-50 text-red-600" },
  { icon: Search, label: "Smart Search", desc: "Natural language property search", color: "bg-teal-50 text-teal-600" },
];

const quickPrompts = [
  "What's the market rent for a 2-bedroom apartment in Westlands?",
  "Analyze occupancy trends and suggest ways to reduce vacancy",
  "Draft a professional lease renewal notice for a tenant",
  "Generate a listing description for a 3-bed villa in Karen",
  "Which of my properties has the best ROI this quarter?",
  "Send me overdue rent reminders for all tenants",
  "What maintenance issues are most critical this week?",
  "Recommend optimal rental prices based on current market data",
];

const sampleConversation: Message[] = [
  {
    role: "assistant",
    content: "Hello! I'm your LETSPACE AI assistant powered by Claude. I can help you manage properties, analyze tenants, optimize pricing, draft communications, and provide Kenyan real estate market insights. What would you like to work on today?",
    timestamp: new Date(),
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(sampleConversation);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (text?: string) => {
    const userMessage = text || input;
    if (!userMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || data.error || "I couldn't process that request.", timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
            <Badge variant="purple" className="text-xs">Powered by Claude</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Kenya&apos;s smartest property management assistant</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Claude Opus 4 · Online
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Panel */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col min-h-[500px]">
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "assistant"
                        ? "bg-blue-600"
                        : "bg-gray-700"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Sparkles className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Message */}
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      msg.role === "assistant"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1.5 ${msg.role === "assistant" ? "text-gray-400" : "text-blue-200"}`}>
                      {msg.timestamp.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Claude is thinking...
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask anything about your properties, tenants, market trends..."
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button onClick={() => handleSend()} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                AI responses are based on your portfolio data + Kenya market knowledge
              </p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Capabilities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">AI Capabilities</CardTitle>
              <CardDescription className="text-xs">What Claude can do for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {aiCapabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.label} className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className={`rounded-lg p-1.5 shrink-0 ${cap.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{cap.label}</p>
                      <p className="text-[10px] text-muted-foreground">{cap.desc}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-2.5 py-2 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
