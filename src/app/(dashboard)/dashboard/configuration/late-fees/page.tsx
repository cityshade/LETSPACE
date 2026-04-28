"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Save, RotateCcw } from "lucide-react";
import Link from "next/link";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Stepper } from "@/components/ui/stepper";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { showUndoToast } from "@/components/ui/undo-toast";
import { Button } from "@/components/ui/button";

// ─── Form shape ───────────────────────────────────────────────────────────────

interface LateFeeForm {
  dueDay: number;
  gracePeriodEnabled: boolean;
  gracePeriodDays: number;
  penaltyType: "fixed_per_day" | "percentage" | "one_time" | "compound";
  penaltyAmount: number;
  capEnabled: boolean;
  capType: "amount" | "percentage";
  capAmount: number;
  agentSplit: number;
  landlordSplit: number;
}

const DEFAULTS: LateFeeForm = {
  dueDay: 10,
  gracePeriodEnabled: false,
  gracePeriodDays: 3,
  penaltyType: "fixed_per_day",
  penaltyAmount: 500,
  capEnabled: false,
  capType: "amount",
  capAmount: 10000,
  agentSplit: 50,
  landlordSplit: 50,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function fmt(n: number) {
  return n.toLocaleString("en-KE");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LateFeeConfigPage() {
  const { watch, setValue, reset, formState } = useForm<LateFeeForm>({
    defaultValues: DEFAULTS,
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [scope, setScope] = useState<"property" | "all">("property");

  const v = watch();

  const set = <K extends keyof LateFeeForm>(field: K, val: LateFeeForm[K]) =>
    setValue(field, val, { shouldDirty: true });

  // ── Derived values ──────────────────────────────────────────────────────────

  const daysLate = 5;
  const baseRent = 35000;
  const latePenalty =
    v.penaltyType === "fixed_per_day"
      ? v.penaltyAmount * daysLate
      : v.penaltyType === "percentage"
      ? Math.round((baseRent * v.penaltyAmount) / 100)
      : v.penaltyAmount;

  const cappedPenalty = v.capEnabled
    ? v.capType === "amount"
      ? Math.min(latePenalty, v.capAmount)
      : Math.min(latePenalty, Math.round((baseRent * v.capAmount) / 100))
    : latePenalty;

  const totalDue = baseRent + cappedPenalty;
  const agentShare = Math.round((cappedPenalty * v.agentSplit) / 100);
  const landlordShare = Math.round((cappedPenalty * v.landlordSplit) / 100);
  const splitValid = v.agentSplit + v.landlordSplit === 100;

  // ── Changes diff for modal ──────────────────────────────────────────────────

  const changes = formState.isDirty
    ? Object.entries(formState.dirtyFields).map(([key]) => {
        const k = key as keyof LateFeeForm;
        return {
          field: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
          from: "Previous",
          to: String(v[k]),
        };
      })
    : [];

  // ── Save flow ───────────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!splitValid) return;
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    // TODO: PATCH /api/properties/[id]/configuration/late-fees
    await new Promise((r) => setTimeout(r, 500));
    setShowConfirm(false);
    reset(v);
    showUndoToast({
      message: "Late fee rules saved",
      description: "Changes apply to next rent cycle.",
      onUndo: () => reset(DEFAULTS),
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4 md:p-6 pb-32">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/configuration"
            className="text-sm text-brown-400 hover:text-brown-600 transition-colors duration-150"
          >
            ← Back to Configuration
          </Link>
          <h1 className="font-serif text-2xl font-bold text-brown-800 mt-1">
            Late Fee Rules
          </h1>
          <p className="text-sm text-brown-400 mt-1">
            Configure how late payment penalties work for this property.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => reset(DEFAULTS)}
          disabled={!formState.isDirty}
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Reset
        </Button>
      </div>

      {/* ── Due Date ── */}
      <div className="bg-white rounded-2xl border border-brown-100 shadow-sm p-6">
        <Stepper
          label="Due Date"
          description="Rent is due on this day of the month."
          value={v.dueDay}
          min={1}
          max={28}
          step={1}
          unit={ordinal(v.dueDay).replace(String(v.dueDay), "") + " of month"}
          onChange={(val) => set("dueDay", val)}
        />
      </div>

      {/* ── Grace Period ── */}
      <div className="bg-white rounded-2xl border border-brown-100 shadow-sm p-6 space-y-4">
        <ToggleSwitch
          label="Grace Period"
          description="Allow tenants extra days before any penalty applies."
          enabled={v.gracePeriodEnabled}
          onChange={(val) => set("gracePeriodEnabled", val)}
        />
        {v.gracePeriodEnabled && (
          <div className="pl-3 border-l-2 border-soil-200">
            <Stepper
              label="Grace Period Length"
              value={v.gracePeriodDays}
              min={0}
              max={30}
              step={1}
              unit="days"
              onChange={(val) => set("gracePeriodDays", val)}
            />
          </div>
        )}
      </div>

      {/* ── Penalty Type ── */}
      <div className="bg-white rounded-2xl border border-brown-100 shadow-sm p-6 space-y-5">
        <SegmentedControl
          label="Penalty Type"
          options={[
            { id: "fixed_per_day", label: "Fixed / Day",   description: "KES 500 per day" },
            { id: "percentage",    label: "% of Rent",     description: "% of monthly rent" },
            { id: "one_time",      label: "One-Time",      description: "Single flat charge" },
            { id: "compound",      label: "Compound",      description: "Increases over time" },
          ]}
          selected={v.penaltyType}
          onChange={(val) => set("penaltyType", val as LateFeeForm["penaltyType"])}
        />
        <Stepper
          label={v.penaltyType === "percentage" ? "Penalty Rate" : "Penalty Amount"}
          value={v.penaltyAmount}
          min={0}
          max={v.penaltyType === "percentage" ? 100 : 100000}
          step={v.penaltyType === "percentage" ? 1 : 50}
          unit={v.penaltyType === "percentage" ? "%" : "KES"}
          onChange={(val) => set("penaltyAmount", val)}
          formatValue={v.penaltyType !== "percentage" ? fmt : undefined}
        />
      </div>

      {/* ── Penalty Cap ── */}
      <div className="bg-white rounded-2xl border border-brown-100 shadow-sm p-6 space-y-4">
        <ToggleSwitch
          label="Penalty Cap"
          description="Limit the maximum penalty that can accumulate."
          enabled={v.capEnabled}
          onChange={(val) => set("capEnabled", val)}
        />
        {v.capEnabled && (
          <div className="pl-3 border-l-2 border-soil-200 space-y-4">
            <SegmentedControl
              label="Cap Type"
              options={[
                { id: "amount",     label: "Max Amount",  description: "Fixed KES limit" },
                { id: "percentage", label: "% of Rent",   description: "Percentage cap" },
              ]}
              selected={v.capType}
              onChange={(val) => set("capType", val as LateFeeForm["capType"])}
            />
            <Stepper
              label="Cap Value"
              value={v.capAmount}
              min={0}
              max={v.capType === "percentage" ? 100 : 500000}
              step={v.capType === "percentage" ? 5 : 500}
              unit={v.capType === "percentage" ? "%" : "KES"}
              onChange={(val) => set("capAmount", val)}
              formatValue={v.capType !== "percentage" ? fmt : undefined}
            />
          </div>
        )}
      </div>

      {/* ── Late Fee Split ── */}
      <div className="bg-white rounded-2xl border border-brown-100 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="font-serif text-lg font-semibold text-brown-800">Late Fee Split</h3>
          <p className="text-sm text-brown-400 mt-1">
            For agent-managed properties. Cornerstone never takes commission on late fees.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Stepper
            label="Agent Gets"
            value={v.agentSplit}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(val) => {
              set("agentSplit", val);
              set("landlordSplit", 100 - val);
            }}
          />
          <Stepper
            label="Landlord Gets"
            value={v.landlordSplit}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(val) => {
              set("landlordSplit", val);
              set("agentSplit", 100 - val);
            }}
          />
        </div>
        {!splitValid && (
          <p className="text-brick-500 text-sm flex items-center gap-1">
            ⚠ Total must equal 100%. Currently: {v.agentSplit + v.landlordSplit}%
          </p>
        )}
        {splitValid && (
          <p className="text-green-600 text-sm">✓ Split is valid</p>
        )}
      </div>

      {/* ── Live Preview ── */}
      <div className="bg-soil-50 rounded-2xl border border-soil-200 p-6">
        <h3 className="font-serif text-lg font-semibold text-brown-800 mb-4">Preview</h3>
        <p className="text-sm text-brown-400 mb-3">
          If tenant pays {daysLate} days late (rent KES {fmt(baseRent)}):
        </p>
        <div className="bg-white rounded-xl border border-brown-100 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-brown-500">Base Rent</span>
            <span className="font-mono font-bold text-brown-800">KES {fmt(baseRent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brown-500">Late Penalty</span>
            <span className="font-mono font-bold text-brick-600">KES {fmt(cappedPenalty)}</span>
          </div>
          {v.capEnabled && cappedPenalty < latePenalty && (
            <div className="flex justify-between text-xs">
              <span className="text-brown-400">Without cap</span>
              <span className="font-mono text-brown-300 line-through">KES {fmt(latePenalty)}</span>
            </div>
          )}
          <hr className="border-brown-100" />
          <div className="flex justify-between font-semibold">
            <span className="text-brown-700">Total Due</span>
            <span className="font-mono font-bold text-soil-600 text-base">KES {fmt(totalDue)}</span>
          </div>
          <hr className="border-brown-100" />
          <div className="flex justify-between text-xs text-brown-400">
            <span>Agent receives ({v.agentSplit}%)</span>
            <span className="font-mono">KES {fmt(agentShare)}</span>
          </div>
          <div className="flex justify-between text-xs text-brown-400">
            <span>Landlord receives ({v.landlordSplit}%)</span>
            <span className="font-mono">KES {fmt(landlordShare)}</span>
          </div>
          <div className="flex justify-between text-xs text-brown-300">
            <span>Cornerstone fee on penalties</span>
            <span className="font-mono">KES 0</span>
          </div>
        </div>
      </div>

      {/* ── Sticky action bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-3 p-4 bg-white/90 backdrop-blur-sm border-t border-brown-100 shadow-lg sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:shadow-none sm:p-0">
        <Button
          size="xl"
          className="w-full"
          onClick={handleSave}
          disabled={!formState.isDirty || !splitValid}
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </Button>
        <Button
          variant="outline"
          size="default"
          className="w-full"
          disabled={!formState.isDirty || !splitValid}
          onClick={() => {
            setScope("all");
            setShowConfirm(true);
          }}
        >
          Apply to All Properties
        </Button>
      </div>

      {/* ── Confirmation modal ── */}
      <ConfirmationModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmSave}
        title="Confirm Late Fee Changes"
        description="Review what you're changing before saving."
        changes={changes}
        scope={scope}
        onScopeChange={setScope}
        confirmLabel="Save Rules"
      />
    </div>
  );
}
