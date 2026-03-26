import { cn, formatCurrency } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: number; // percentage change
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  href?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
  trend,
  isCurrency = false,
  prefix,
  suffix,
  className,
}: StatCardProps) {
  const displayValue = isCurrency
    ? formatCurrency(Number(value))
    : `${prefix || ""}${Number(value).toLocaleString()}${suffix || ""}`;

  const trendColor =
    trend === undefined ? "" : trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500";
  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 tabular-nums truncate">
            {displayValue}
          </p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          {trend !== undefined && TrendIcon && (
            <div className={cn("mt-2 flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3 shrink-0", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  );
}
