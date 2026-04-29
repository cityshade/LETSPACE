"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolCall {
  name: string;
  input: unknown;
  result: unknown;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
  error?: boolean;
}

// ─── Tool call names → labels ─────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  get_portfolio_summary: "Fetched portfolio summary",
  get_tenants:           "Queried tenant records",
  get_maintenance:       "Checked maintenance tickets",
  get_financial_report:  "Pulled financial report",
  run_automation:        "Triggered automation",
  get_cron_status:       "Checked automation status",
};

// ─── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Portfolio summary",     prompt: "Give me a full portfolio summary" },
  { label: "Overdue tenants",       prompt: "Show me all overdue tenants" },
  { label: "Send SMS reminders",    prompt: "Run the SMS cadence for overdue tenants" },
  { label: "Run late fees",         prompt: "Run late fee accrual for today" },
  { label: "Financial report",      prompt: "Give me this month's financial report" },
  { label: "System status",         prompt: "Show me the automation job status" },
];

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-7 w-7 rounded-full bg-soil-600 flex items-center justify-center shrink-0 mt-0.5">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      <div className={cn("max-w-[85%] space-y-2", isUser && "items-end flex flex-col")}>
        {/* Tool call pills */}
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.toolCalls.map((tc, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-soil-50 border border-soil-200 px-2.5 py-0.5 text-[11px] text-soil-700 font-medium"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-soil-500" />
                {TOOL_LABELS[tc.name] ?? tc.name}
              </span>
            ))}
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-soil-600 text-white rounded-tr-sm"
              : msg.error
              ? "bg-brick-50 border border-brick-200 text-brick-800 rounded-tl-sm"
              : "bg-white border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm"
          )}
        >
          <FormattedContent content={msg.content} isUser={isUser} />
        </div>

        <p className="text-[10px] text-gray-400 px-1">
          {msg.timestamp.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {isUser && (
        <div className="h-7 w-7 rounded-full bg-brown-200 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[11px] font-bold text-brown-700">JK</span>
        </div>
      )}
    </div>
  );
}

// ─── Formatted content (renders tables and lists from markdown-lite) ──────────

function FormattedContent({ content, isUser }: { content: string; isUser: boolean }) {
  // Split on newlines, render tables and bold
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        // Table row: | col | col |
        if (line.startsWith("|") && line.endsWith("|")) {
          const cells = line.split("|").filter((c) => c.trim() !== "");
          const isSeparator = cells.every((c) => /^[-: ]+$/.test(c));
          if (isSeparator) return null;
          return (
            <div key={i} className={cn(
              "grid gap-1 text-xs font-mono",
              `grid-cols-${Math.min(cells.length, 6)}`
            )}>
              {cells.map((cell, j) => (
                <span key={j} className={cn(
                  "truncate",
                  i === 0 ? "font-semibold" : ""
                )}>{cell.trim()}</span>
              ))}
            </div>
          );
        }

        // Bold **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        if (parts.length > 1 || line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <p key={i} className={cn("leading-relaxed", line.startsWith("- ") || line.startsWith("• ") ? "pl-2" : "")}>
              {parts.map((part, j) =>
                part.startsWith("**") && part.endsWith("**")
                  ? <strong key={j}>{part.slice(2, -2)}</strong>
                  : <span key={j}>{part.replace(/^[-•] /, "· ")}</span>
              )}
            </p>
          );
        }

        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i} className="leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="h-7 w-7 rounded-full bg-soil-600 flex items-center justify-center shrink-0">
        <Zap className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "I'm Cornerstone, your AI property manager. I have live access to your portfolio, can trigger automations, and act on your instructions. What do you need?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const userMsg = text.trim();
    if (!userMsg || loading) return;
    setInput("");

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMsg,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages((m) => [
          ...m,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: data.error || "Something went wrong. Please try again.",
            timestamp: new Date(),
            error: true,
          },
        ]);
      } else {
        const assistantMsg: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.response,
          toolCalls: data.toolCalls,
          timestamp: new Date(),
        };
        setMessages((m) => [...m, assistantMsg]);
        setHistory((h) => [
          ...h,
          { role: "user", content: userMsg },
          { role: "assistant", content: data.response },
        ]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Network error. Check your connection and try again.",
          timestamp: new Date(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const reset = () => {
    setMessages([{
      id: "0",
      role: "assistant",
      content: "I'm Cornerstone, your AI property manager. I have live access to your portfolio, can trigger automations, and act on your instructions. What do you need?",
      timestamp: new Date(),
    }]);
    setHistory([]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-white shrink-0">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Cornerstone AI</h1>
          <p className="text-xs text-gray-500">Claude Opus 4.7 · Kamau Properties</p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-xs gap-1.5 text-gray-500">
          <RotateCcw className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 md:px-6 py-2 bg-white border-t overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => send(a.prompt)}
              disabled={loading}
              className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-soil-50 hover:border-soil-300 hover:text-soil-700 transition-colors disabled:opacity-40"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 md:px-6 py-3 bg-white border-t shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask anything or give an instruction..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-soil-400 focus:bg-white transition-colors disabled:opacity-50 min-h-[42px] max-h-32"
            style={{ height: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 128) + "px";
            }}
          />
          <Button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-[42px] w-[42px] shrink-0"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </Button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 px-1">
          Enter to send · Shift+Enter for new line · All data sourced from live tools
        </p>
      </div>
    </div>
  );
}
